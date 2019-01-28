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

    location / {
        root   "{{LANDO_WEBROOT}}";
        index  index.html index.htm;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   "{{LANDO_WEBROOT}}";
    }
}
