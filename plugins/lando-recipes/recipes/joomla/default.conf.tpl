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

  root "{{LANDO_WEBROOT}}";
  index index.php index.html index.htm default.html default.htm;

  # Support Clean (aka Search Engine Friendly) URLs
  location / {
      try_files $uri $uri/ /index.php?$args;
  }

  # deny running scripts inside writable directories
  location ~* /(images|cache|media|logs|tmp)/.*\.(php|pl|py|jsp|asp|sh|cgi)$ {
      return 403;
      error_page 403 /403_error.html;
  }

  location ~ \.php$ {
      fastcgi_pass fpm:9000;
      fastcgi_index index.php;
      include fastcgi_params;
      fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
  }

  # caching of files
  location ~* \.(ico|pdf|flv)$ {
      expires 1y;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|swf|xml|txt)$ {
      expires 14d;
  }

}
