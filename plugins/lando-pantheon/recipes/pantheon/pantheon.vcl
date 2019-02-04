vcl 4.0;
# For debugging, use the following and inspect the output of `varnishlog`:
#

sub vcl_recv {

  # Always have a `has_js=1` cookie. This is set by Drupal to indicate that the
  # client browser supports JavaScript.
  # TODO (Mark): It isn't clear *why* we want to force has_js=1, update this
  #              comment if you know, please.
  #
  # NOTE(jesse): WAT
  #   https://www.drupal.org/node/229825  seems to be there reason why here?
  if (req.http.Cookie) {
    if (req.http.Cookie !~ "has_js=1") {
      set req.http.Cookie = "has_js=1; " + req.http.Cookie;
    }
  } else {
    set req.http.Cookie = "has_js=1";
  }

  if (req.restarts == 0) {
    if (req.http.x-forwarded-for) {
      set req.http.X-Forwarded-For =
          req.http.X-Forwarded-For + ", " + client.ip;
    } else {
      set req.http.X-Forwarded-For = client.ip;
    }
  }

  # Do not cache these paths, note that sometimes query strings are appended.
  if (req.url ~ "^/install.php" ||
      req.url ~ "^/update\.php" ||
      req.url ~ "^/cron\.php") {
        return (pass);
  }

  # Pipe backup_migrate directly
  if (req.url ~ "^/admin/content/backup_migrate/export" || req.url ~ "^/system/files") {
    return (pipe);
  }

  # Do not cache potentially large files.
  if (req.url ~ "(?i)\.(mp3|flv|mov|mp4|mpg|mpeg|avi|mkv|ogg|oggv|wmv|rm|m4v|3gp|dmg|pdf)($|\?)") {
    return (pipe);
  }

  # Specify the ESI capability (http://www.w3.org/TR/edge-arch)
  # Note: This clobbers upstream capabilities, should nicely append styx's capabilities.
  set req.http.Surrogate-Capability = {"styx="ESI/1.0""};

  # Normalize the Accept-Encoding header. See http://varnish-cache.org/wiki/FAQ/Compression
  if (req.http.Accept-Encoding) {
    if (req.url ~ "\.(jpg|png|gif|gz|tgz|bz2|tbz|mp3|ogg)$" || req.url ~ "^/robots\.txt$") {
      # No point in compressing these
      unset req.http.Accept-Encoding;
    }
    elsif (req.http.Accept-Encoding ~ "gzip") {
      set req.http.Accept-Encoding = "gzip";
    }
    else {
      # unknown algorithm
      unset req.http.Accept-Encoding;
    }
  }

  # Strip all cookies on requests for asset files. This ensures cache-busting
  # session cookies do not cause cache misses for these.
  #
  # Query strings may have a random series of letters/numbers (Drupal doing its
  # cache-busting), or it may have "itok=xyz" which is for image derivatives, or
  # in the case of Wordpress, it may have "ver=x.y.z" for css / js files. We can
  # safely remove cookies on all of these, as static files don't vary according
  # to a user's session cookie.
  #
  # In our nginx configuration, we explicitly set assets returned in dev and
  # multidev environments to expire in the past, which essentially overrides
  # any Varnish configuration that might attempt to cache those assets. This
  # is so that developers always have fresh content while editing files.
  #
  # This list of file extensions is also in vcl_backend_response(), keep them in sync.
  if (req.url ~ "(?i)\.(png|gif|jpeg|jpg|ico|bmp|tif|tiff|webp|swf|css|js)($|\?)") {
    unset req.http.Cookie;
  }

  # WARNING: Note that any code below the following will not be processed for
  # POST and other non-GET and non-HEAD requests!

  # Any unknown (Non-RFC2616 or CONNECT) request methods will be piped to the backend,
  # as we can't make any caching decisions about those. We need to allow PURGE to
  # pass as cookie munging is important for purging the correct object.
  if (req.method != "GET" &&
    req.method != "HEAD" &&
    req.method != "PUT" &&
    req.method != "POST" &&
    req.method != "TRACE" &&
    req.method != "OPTIONS" &&
    req.method != "DELETE" &&
    req.method != "PURGE") {
      return (pipe);
  }

  # We only cache GET and HEAD requests, so allow requests for other HTTP verbs
  # to pass through without stripping cookies, etc.
  if (req.method != "GET" &&
    req.method != "HEAD" &&
    req.method != "PURGE") {
    return (pass);
  }

  # Strip away Google analytics cruft from GET queries.
  # https://pantheon-systems.desk.com/agent/case/976
  # Based on original GA cookie cleaner
  # A previous version of the match was for (__[a-z|_]) and utm_[a-z|_].
  # Is the pipe (|) intended to match a literal pipe, or is it an error
  # signifying 'or' as in a-z or _, and doesn't belong? Leaving it for now.
  if (req.url ~ "(\?|\&)(__[a-z|_A-Z-]+|utm_[a-z|_A-Z-]+)") {
    # Side-save magic: capture the portion of the url that starts the utm block.
    # We will reverse this below in vcl_deliver() if there's a redirect, so
    # customers don't end up with PANTHEON_STRIPPED all up in their GA reports
    # just because they put out a link to a redirect.
    #
    # This process isn't perfect. The capture will take everything from the beginning
    # of the first occurrence of utm_, and restore it the same way. If a redirect
    # is triggered, and the redirect appends query parameters after the first utm_,
    # they will be lost. This could be fixed robustly by not using regular
    # expressions here in this fashion, and instead using a Varnish module (vmod)
    # to handle it. Or better targeting of the utm_ var names.
    set req.http.X-Pre-Strip = regsub(req.url, ".*?.*?(utm_.*)", "\1");

    # Notice that even though the Pre-Strip is captured in a basic fashion for redirects,
    # in general stripping is quite precise. Here the __xyz and utm_ params are
    # correctly carved out leaving any preceding and following params intact.
    set req.url = regsuball(req.url, "(\?|\&)(__[a-z|_A-Z-]+|utm_[a-z|_A-Z-]+)=([^\&]*)", "\1\2=PANTHEON_STRIPPED");
  }

  # Cookie munging!
  if (req.http.Cookie) {
    # Prefix the existing cookie header with ";" to make all cookies
    # have the form ";$name=$value" for better regexing.
    set req.http.Cookie = ";" + req.http.Cookie;

    # Remove any spaces between semicolons and the beginnings of cookie names.
    set req.http.Cookie = regsuball(req.http.Cookie, "; +", ";");

    # Nuke the annoyingly patterned wordpress_test_cookie
    set req.http.Cookie = regsuball(req.http.Cookie, ";wordpress_test[^;]*", "");

    # We bypass the cache if there is a NO_CACHE or login-related cookie set.
    # Also check for SimpleSAML or Facebook cookies to support external auth.

    if (req.http.Cookie ~ ";NO_CACHE=" ||
      req.http.Cookie ~ ";S+ESS[a-z0-9]+=" ||
      req.http.Cookie ~ ";fbs[a-z0-9_]+=" ||
      req.http.Cookie ~ ";SimpleSAML[A-Za-z]+=" ||
      req.http.Cookie ~ ";SimpleSAML[A-Za-z]+=" ||
      req.http.Cookie ~ ";PHPSESSID=" ||
      req.http.Cookie ~ ";wordpress[A-Za-z0-9_]*=" ||
      req.http.Cookie ~ ";wp-[A-Za-z0-9_]+=" ||
      req.http.Cookie ~ ";comment_author_[a-z0-9_]+=" ||
      req.http.Cookie ~ ";duo_wordpress_auth_cookie=" ||
      req.http.Cookie ~ ";duo_secure_wordpress_auth_cookie=" ||
      req.http.Cookie ~ ";bp_completed_create_steps=" ||
      req.http.Cookie ~ ";bp_new_group_id=" ||
      req.http.Cookie ~ ";wp-resetpass-[A-Za-z0-9_]+=" ||
      req.http.Cookie ~ ";(wp_)?woocommerce[A-Za-z0-9_-]+=") {

      # This flag will be picked up further down vcl_recv() and will trigger a pass.
      set req.http.X-Bypass-Cache = "1";
    }

    # Add back a space between the semicolon and cookie name for each cookie we
    # intend to pass to the back-end. Starting with login-related cookies.
    set req.http.Cookie = regsuball(req.http.Cookie, ";(NO_CACHE=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(S+ESS[a-z0-9]+=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(fbs[a-z0-9_]+=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(SimpleSAML[A-Za-z]+=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(SimpleSAML[A-Za-z]+=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(PHPSESSID=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(wordpress[A-Za-z0-9_]*=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(wp-[A-Za-z0-9_]+=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(comment_author_[a-z0-9_]+=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(duo_wordpress_auth_cookie=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(duo_secure_wordpress_auth_cookie=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(bp_completed_create_steps=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(bp_new_group_id=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(wp-resetpass-[A-Za-z0-9_]+=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";((wp_)?woocommerce[A-Za-z0-9_-]+=)", "; \1");

    # Same thing for cache-varying cookies: add back a space between the semicolon
    # and cookie name. These are different to the login-related cookies above, as we
    # allow caching for these; we will keep a separate copy of the content per cookie value.
    set req.http.Cookie = regsuball(req.http.Cookie, ";(STYXKEY[a-zA-Z0-9_-]+=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(has_js=)", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(Drupal[a-zA-Z0-9_\.-]+=)", "; \1");

    # This is a BuddyPress pattern used in filtering/sorting content.
    set req.http.Cookie = regsuball(req.http.Cookie, ";(bp-[a-z]+-(scope|filter))", "; \1");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(bp-message-[A-Za-z1-9_-]+)", "; \1");

    # WARNING: When adding more cache-varying cookies here, update the `purge_varnish`
    # task in Yggdrasil, which also maintains a list of these cookies.


    # Strip all cookies lacking the telltale space between the semicolon and cookie name.
    set req.http.Cookie = regsuball(req.http.Cookie, ";[^ ][^;]*", "");

    # Replace any leading or trailing spaces and semicolons. This leaves
    # a completely empty cookie header if there are no cookies left.
    set req.http.Cookie = regsuball(req.http.Cookie, "^[; ]+|[; ]+$", "");

    # If the cookie header is empty, drop it entirely.
    if (req.http.Cookie == "") {
      unset req.http.Cookie;
    }
  }

  # Not cacheable.
  if (req.http.Authorization) {
    return (pass);
  }

  # We perform a lookup even if there are cookies, as any cookies present on a
  # request that has made it this far in vcl_recv(), will be used as a Cache-Varying
  # cookie in vcl_hash().
  return (pass);
}

sub vcl_pipe {
  # Called upon entering pipe mode.
  # In this mode, the request is passed on to the backend, and any further data from both the client
  # and backend is passed on unaltered until either end closes the connection. Basically, Varnish will
  # degrade into a simple TCP proxy, shuffling bytes back and forth. For a connection in pipe mode,
  # no other VCL subroutine will ever get called after vcl_pipe.

  # Note that only the first request to the backend will have
  # X-Forwarded-For set.  If you use X-Forwarded-For and want to
  # have it set for all requests, make sure to have:
  # set bereq.http.connection = "close";
  # here.  It is not set by default as it might break some broken web
  # applications, like IIS with NTLM authentication.
  set bereq.http.connection = "close";

  # Implementing websocket support (https://www.varnish-cache.org/docs/4.0/users-guide/vcl-example-websockets.html)
  if (req.http.upgrade) {
    set bereq.http.upgrade = req.http.upgrade;
  }
}

sub vcl_backend_response {
  # Don't allow static files to set cookies. This list of file extensions is also
  # in vcl_recv(), keep them in sync.
  if (bereq.url ~ "(?i)\.(png|gif|jpeg|jpg|ico|bmp|tif|tiff|webp|swf|css|js)($|\?)") {
    unset beresp.http.set-cookie;
  }

  # Only cache 404s in the filesystem for 30s.
  if (bereq.url ~ "^/sites/default/files/" && beresp.status == 404) {
    set beresp.ttl = 30s;
    set beresp.http.Cache-Control = "public, max-age=30";
  }

  # Caching for permanent redirects (301s).
  if (beresp.status == 301) {
    if (beresp.http.Location == bereq.http.X-Proto + bereq.http.Host + bereq.url) {
      # Do not cache requests that 301 to themselves for very long.
      set beresp.http.Cache-Control = "public, max-age=3";
      set beresp.ttl = 3s;
      set beresp.http.X-Pantheon-Debug = "Circular redirect detected.";
    }
    else if (beresp.http.Location ~ "/\?q=") {
      # Do not cache 301s that redirect to ?q=
      # Misfiring clean urls
      # https://pantheon-systems.desk.com/agent/case/15792
      set beresp.http.Cache-Control = "public, max-age=3";
      set beresp.ttl = 3s;
      set beresp.http.X-Pantheon-Debug = "Wow. Such redirect.";
    }
    else if (beresp.http.x-pantheon-endpoint ~ ",") {
      # Comma in your endpoint header? Go jump in a lake. This is a bug.
      set beresp.http.Cache-Control = "no-cache, must-revalidate, post-check=0, pre-check=0";
      set beresp.ttl = 0s;
    }
    else if (!beresp.http.Cache-Control) {
      # Otherwise if no headers, a day is good.
      set beresp.ttl = 1d;
      set beresp.http.Cache-Control = "public, max-age=86400";
    }
  }

  # Enable ESI processing if requested
  if (beresp.http.Surrogate-Control ~ "ESI/1.0" && !bereq.http.X-Bypass-Pantheon-Esi) {
    unset beresp.http.Surrogate-Control;
    set beresp.do_esi = true;
    set beresp.http.X-Styx-Attempted-ESI = "1";
  }

  # Don't cache a redirect to install.php
  if (beresp.http.Location ~ "/install.php$") {
    # set beresp.ttl = 120s;
    set beresp.uncacheable = true;
    return (deliver);
  }

  # Strip content encoding for 301 and 302 responses.
  # The content is useless to browsers, and an incorrect
  # encoding causes Varnish 3 to return a 503 because
  # Varnish 3 is encoding-aware.
  if (beresp.status == 301 || beresp.status == 302) {
    unset beresp.http.content-encoding;
  }

  # beresp.grace is the length of time Varnish will keep cache objects beyond their TTL.
  # So if we have a header `Cache-Control: public, max-age=900`, we'll keep that for 900
  # seconds + the grace period here. This doesn't actually cause the stale objects to be
  # served; for that, see `bereq.grace` in `vcl_recv()`. This value must be at minimum the
  # value of bereq.grace, otherwise we would be essentially telling Varnish to serve stale
  # content for a longer period of time than we're actually storing it.
  set beresp.grace = 120m;

  # Smart bans. Varnish has a ban lurker thread, which will test old objects against
  # bans periodically, without a client. For it to work, your bans can not refer to anything
  # starting with `req`, as the ban lurker doesn’t have any request data structure.
  #
  # @see: https://www.varnish-software.com/static/book/Cache_invalidation.html
  set beresp.http.x-url = bereq.url;
  set beresp.http.x-host = bereq.http.host;

  # Varnish ignores 'no-cache' by itself and only looks at 'max-age' in the
  # Cache-Control headers.
  #
  # So, if the response's Cache-Control has only half the required pieces,
  # add the rest in here so we don't cache the page. This is mostly to
  # support customers who are executing PHP outside of Drupal/Wordpress.
  if (beresp.http.Cache-Control == "no-cache") {
    set beresp.ttl = 0s;
    set beresp.http.Cache-Control = "no-cache, must-revalidate, post-check=0, pre-check=0";
    # set beresp.ttl = 120s;
    set beresp.uncacheable = true;
    return (deliver);
  }
}

sub vcl_hash {
  # Called after vcl_recv to create a hash value for the request. This is used as a key
  # to look up the object in Varnish.

  if (req.http.X-Forwarded-Proto) {
    hash_data(req.http.X-Forwarded-Proto);
  }
  if (req.http.X-SSL) {
    hash_data(req.http.X-SSL);
  }
  if (req.http.Cookie) {
    hash_data(req.http.Cookie);
  }
}
sub vcl_miss {
  # go fetch!
  return (fetch);
}

sub vcl_hit {
  if (obj.ttl >= 0s) {
    # A pure unadultered hit, deliver it
    return (deliver);
  }

  # https://www.varnish-cache.org/docs/trunk/users-guide/vcl-grace.html

# if (!std.healthy(req.backend_hint) && (obj.ttl + obj.grace > 0s)) {
#   return (deliver);
# } else {
#   return (fetch);
# }

  # We have no fresh fish. Lets look at the stale ones.
  if (std.healthy(req.backend_hint)) {
    # Backend is healthy. Limit age to 10s.
    if (obj.ttl + 10s > 0s) {
      #set req.http.grace = "normal(limited)";
      return (deliver);
    } else {
      # No candidate for grace. Fetch a fresh object.
      return(fetch);
    }
  } else {
    # backend is sick - use full grace
      if (obj.ttl + obj.grace > 0s) {
      #set req.http.grace = "full";
      return (deliver);
    } else {
      # no graced object.
      return (fetch);
    }
  }

  # fetch & deliver once we get the result
  return (fetch); # Dead code, keep as a safeguard
}

sub vcl_deliver {

  # the following is commented out for security reasons. Do not expose the public IP's of styx boxes because
  # it can give attackers the ability to attack styx nodes directly and bypass any masking that someone may be doing
  # by pointing their DNS through a filtering service like Cloudflare.
  # set resp.http.X-Pantheon-Edge-Server = server.ip;
  if (resp.http.Content-Type ~ "(text/html)") {
    set resp.http.Vary = resp.http.Vary + ", Cookie";
    # We are busting browser caching on any html pages for Safari since it
    # does not RESPECT the Vary on Cookie header.
    if (req.http.user-agent ~ "Safari" && !req.http.user-agent ~ "Chrom") {
      set resp.http.Cache-Control = "no-cache";
    }
  }

  # Reverse the side-save magic for PANTHEON_STRIPPED, see `vcl_recv()` function.
  if ((resp.status == 301 || resp.status == 302) && req.http.X-Pre-Strip && req.http.X-Pre-Strip != "") {
    set resp.http.X-Pre-Strip-Debug = req.http.X-Pre-Strip;

    # If the backend responds with a redirect, but the Location header doesn't contain
    # any utm_ query string parameters, but we know we replaced them with PANTHEON_STRIPPED,
    # then we do the customer a favor and put them back again. We shouldn't really do this
    # but core Drupal does lose params when `drupal_goto('abcdef')` is called.
    if (resp.http.Location !~ "(\?|\&)utm_.*") {

      if (resp.http.Location !~ ".*\?") {
        # If there are no query parameters on the Location response, append a `?`. We
        # will be the only parameter in this case.
        set req.http.X-Pre-Strip = "?" + req.http.X-Pre-Strip;
      }
      else {
        set req.http.X-Pre-Strip = "&" + req.http.X-Pre-Strip;
      }
      set resp.http.Location = resp.http.Location + req.http.X-Pre-Strip;
    }
    else {
      # Strip out utm_* from the Location header, then add the values we stripped back on.
      # This results in the utm_ parameters always being added to the end of the Location
      # header.
      set resp.http.Location = regsub(resp.http.Location, "(.*\?.*?)utm_.*", "\1") + req.http.X-Pre-Strip;
    }
  }
}
