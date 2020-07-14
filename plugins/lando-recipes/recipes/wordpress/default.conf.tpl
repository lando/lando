# WordPress single site rules.
# Designed to be included in any server {} block.

# Upstream to abstract backend connection(s) for php
upstream php {
  server fpm:9000;
}

server {

  listen 80 default_server;
  listen 443 ssl;

  server_name localhost;

  ssl_certificate           /certs/cert.crt;
  ssl_certificate_key       /certs/cert.key;
  ssl_verify_client         off;

  ssl_session_cache    shared:SSL:1m;
  ssl_session_timeout  5m;

  ssl_ciphers  HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers  on;

  port_in_redirect off;
  client_max_body_size 100M;

  ## Your only path reference.
  root "{{LANDO_WEBROOT}}";

  ## This should be in your http block and if it is, it's not needed here.
  index index.php;

  location = /favicon.ico {
    log_not_found off;
    access_log off;
  }

  location = /robots.txt {
    allow all;
    log_not_found off;
    access_log off;
  }

  location / {
    # This is cool because no php is touched for static content.
    # include the "?$args" part so non-default permalinks doesn't break when using query string
    try_files $uri $uri/ /index.php?$args;
  }

  location ~ \.php$ {
    #NOTE: You should have "cgi.fix_pathinfo = 0;" in php.ini
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_param PATH_TRANSLATED $document_root$fastcgi_script_name;
    include fastcgi_params;
    fastcgi_intercept_errors on;
    fastcgi_pass php;
    fastcgi_buffers 16 16k;
    fastcgi_buffer_size 32k;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires max;
    log_not_found off;
  }
}
