# We use $http_user_agent_https to determine if the request arrived at the platform
# as an http or an https request. Capture that here for use later. $client_scheme
# will be appropriately set to either http or https.
map $http_user_agent_https $client_scheme {
    default $scheme;
    ON https;
    OFF http;
}

server {
    listen 80 default_server;
    listen 443 ssl;
    server_name localhost;

    add_header X-Pantheon-Site TBD always;
    add_header X-Pantheon-Environment lando always;

    root "{{LANDO_WEBROOT}}";
    index index.php index.html index.htm;
    port_in_redirect off;

    client_max_body_size 100M;

    gzip              on;
    gzip_proxied      any;
    gzip_types        text/plain text/html text/css application/x-javascript application/json text/xml application/xml application/xml+rss text/javascript application/x-font-ttf font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_vary         on;
    gzip_http_version 1.0;

    ssl_certificate           /certs/cert.crt;
    ssl_certificate_key       /certs/cert.key;
    ssl_verify_client         off;
    keepalive_timeout         70;

    # No reading git files
    location ~ /\.git {
        deny all;
    }

    # Original formula Drupal code protection as per .htaccess
    location ~ \.(engine|inc|info|install|make|module|profile|test|po|sh|.*sql|theme|tpl(\.php)?|xtmpl)(~|\.sw[op]|\.bak|\.orig|\.save)?$|^(\..*|Entries.*|Repository|Root|Tag|Template|composer\.(json|lock))$|^#.*#$|\.php(~|\.sw[op]|\.bak|\.orig\.save)$ {
        # Go straight to @cleanurl without 'try_files' or php execution
        try_files pantheon_blocked_file.html @cleanurl;
    }

    # Protect /private (for private code)
    location ~ ^/private/ {
        return 403;
    }
    # Protect /sites/default/files/private (for private files)
    location ~ ^/sites/default/files/private/ {
        return 403;
    }
    # Protect the pantheon.yml file (Quicksilver / platform configuration)
    location ~ ^/pantheon.yml$ {
        return 403;
    }
    # Protect /sites/default/config (for staging configuration)
    location ~ ^/sites/default/config/ {
        return 403;
    }
    # Protect /sites/default/files/config (for active configuration)
    location ~ ^/sites/default/files/config/ {
        return 403;
    }
    location ~ /sites/default/files/.*\.php$ {
        return 403;
    }
    location ~ ^/robots.txt {
        add_header X-Pantheon-Site TBD always;
        add_header X-Pantheon-Environment lando always;
        add_header Cache-Control max-age=86000;
        root /srv/error_pages;
    }

    # Web fonts support.
    location ~* \.(eot|ttf|woff|woff2|otf|svg)$ {
        auth_basic $auth_basic_realm;
        add_header X-Pantheon-Site TBD always;
        add_header X-Pantheon-Environment lando always;
        add_header Access-Control-Allow-Origin *;  # Firefox needs this.

        try_files $uri $uri/ /index.php?$args;


        expires       -1;
        log_not_found off;
    }

    # Support for .svgz
    location ~* \.(svgz)$ {
        auth_basic $auth_basic_realm;

        try_files $uri $uri/ /index.php?$args;

        expires       -1;

        add_header X-Pantheon-Site TBD always;
        add_header X-Pantheon-Environment lando always;
        add_header Content-encoding gzip;  # So browsers will gunzip

        gzip          off; # don't double-compress
    }

    # Set the expiration for assets to 1 day, except in dev.
    # This could be done with an 'if' in the '/' location, but the
    # http://wiki.nginx.org/IfIsEvil page is scary.
    location ~ \.(js|JS|css|CSS|png|PNG|igs|IGS|iges|IGES|jpg|JPG|jpeg|JPEG|gif|GIF|ico|ICO|txt|TXT|xml)$ {
        auth_basic $auth_basic_realm;

        try_files $uri $uri/ /index.php?$args;

        expires          -1;
        log_not_found    off;
    }

    location / {
        auth_basic $auth_basic_realm;
        # @drupal is true for d6, d7 and d8. We want to use @cleanurl for d6 and d7.
        try_files $uri $uri/ /index.php?$args;
        # Catch directory listing errors (i.e. no code)
        error_page 403 =561 /403.html;
        error_page 301 =301 $client_scheme://$host$uri/$is_args$args;
    }

    location @cleanurl {
        rewrite ^/(.*)$ /index.php?q=$1 last;
    }

    # Block any php file in the 'vendor' directory
    # n.b. In order for this to be secure, it must match the allowed
    # fastcgi_locations locations defined in _appserver_bindings.rb.
    # Currently, '\.php$' is the only on that overlaps with '^/vendor/'.
    location ~ ^/vendor/.* {
        # Go straight to @cleanurl without 'try_files' or php execution
        try_files pantheon_blocked_file.html /index.php?$args;
    }


    # These need to be listed from most specific to most general.
    location ~ ^/simplesaml/ {
        auth_basic $auth_basic_realm;

        # There could be several add_header directives. These directives are inherited from the previous level if and only if there are no add_header directives defined on the current level.
        # As per: http://nginx.org/en/docs/http/ngx_http_headers_module.html
        add_header X-Pantheon-Site TBD always;
        add_header X-Pantheon-Environment lando always;
        add_header X-Pantheon-Phpreq yes always;

        fastcgi_intercept_errors on;
        fastcgi_pass fpm:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        # Allow SimpleSamlPHP to work by settig PATH_INFO, etc
        fastcgi_split_path_info ^(.+?\.php)(|/.*)$;
        fastcgi_param SCRIPT_FILENAME "{{LANDO_WEBROOT}}$fastcgi_script_name";
        # Catch php-fpm timeout errors
        error_page 504 /504.html;
    }
    location ~ ^/update.php|authorize.php {
        auth_basic $auth_basic_realm;

        # There could be several add_header directives. These directives are inherited from the previous level if and only if there are no add_header directives defined on the current level.
        # As per: http://nginx.org/en/docs/http/ngx_http_headers_module.html
        add_header X-Pantheon-Site TBD always;
        add_header X-Pantheon-Environment lando always;
        add_header X-Pantheon-Phpreq yes always;

        # Content-Type: text/html; charset=UTF-8
        fastcgi_param PHP_VALUE "default_mimetype=\"text/html\"
default_charset=\"UTF-8\"";
        fastcgi_intercept_errors on;
        fastcgi_pass fpm:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        # Allow SimpleSamlPHP to work by settig PATH_INFO, etc
        fastcgi_split_path_info ^(.+?\.php)(|/.*)$;
        fastcgi_param SCRIPT_FILENAME "{{LANDO_WEBROOT}}$fastcgi_script_name";
        # Catch php-fpm timeout errors
        error_page 504 /504.html;
    }
    location ~ \.php$ {
        auth_basic $auth_basic_realm;

        # There could be several add_header directives. These directives are inherited from the previous level if and only if there are no add_header directives defined on the current level.
        # As per: http://nginx.org/en/docs/http/ngx_http_headers_module.html
        add_header X-Pantheon-Site TBD always;
        add_header X-Pantheon-Environment lando always;
        add_header X-Pantheon-Phpreq yes always;

        try_files $uri $uri/ /index.php?$args;
        # Content-Type: text/html; charset=UTF-8
        fastcgi_param PHP_VALUE "default_mimetype=\"text/html\"
default_charset=\"UTF-8\"";
        fastcgi_intercept_errors on;
        fastcgi_pass fpm:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        # Allow SimpleSamlPHP to work by settig PATH_INFO, etc
        fastcgi_split_path_info ^(.+?\.php)(|/.*)$;
        fastcgi_param SCRIPT_FILENAME "{{LANDO_WEBROOT}}$fastcgi_script_name";
        # Catch php-fpm timeout errors
        error_page 504 /504.html;
    }

    location ~ /\.ht {
        deny all;
    }

}
