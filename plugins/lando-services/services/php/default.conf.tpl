server {
    listen   80;
    listen   [::]:80 default ipv6only=on;
    server_name  localhost;

    root   "{{LANDO_WEBROOT}}";
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
