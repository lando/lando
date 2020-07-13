server {
    listen       80;
    server_name  localhost;

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
