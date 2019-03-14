#
# nginx configuration example for CakePHP 2.x
#

server {
  listen       443 ssl;
  listen       80;
  server_name  localhost;

  ssl_certificate      /certs/cert.crt;
  ssl_certificate_key  /certs/cert.key;

  ssl_session_cache    shared:SSL:1m;
  ssl_session_timeout  5m;

  ssl_ciphers  HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers  on;

  root "{{LANDO_WEBROOT}}";
  index index.php index.html index.htm;

  location / {
    try_files $uri $uri/ /index.php?$args;
    rewrite ^/$ /app/webroot/ break;
    rewrite ^(.*)$ /app/webroot/$1 break;
  }
  location /app/ {
    rewrite ^/$ /webroot/ break;
    rewrite ^(.*)$ /webroot/$1 break;
  }
  location /app/webroot/ {
    if (!-e $request_filename) {
      rewrite ^(.*)$ /index.php break;
    }
  }

  location ~ \.php$ {
    try_files $uri =404;
    include fastcgi_params;
    fastcgi_pass fpm:9000;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
  }
}

