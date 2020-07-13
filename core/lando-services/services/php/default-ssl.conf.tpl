server {
    listen       443 ssl;
    listen       80;
    listen   [::]:80 default ipv6only=on;
    server_name  localhost;

    ssl_certificate      /certs/cert.crt;
    ssl_certificate_key  /certs/cert.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    root "{{LANDO_WEBROOT}}";
    index index.php index.html index.htm;

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+?\.php)(/.*)$;
        fastcgi_pass fpm:9000;
        fastcgi_index  index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_buffers 256 128k;
        fastcgi_connect_timeout 300s;
        fastcgi_send_timeout 300s;
        fastcgi_read_timeout 300s;
        include fastcgi_params;
    }
}
