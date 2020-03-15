
{{#if NGINX_DAEMON_USER}}{{#if NGINX_DAEMON_GROUP}}
user {{NGINX_DAEMON_USER}} {{NGINX_DAEMON_GROUP}};
{{/if}}{{/if}}

worker_processes  auto;

error_log  "{{NGINX_LOGDIR}}/error.log warn";
pid        "{{NGINX_TMPDIR}}/nginx.pid";

events {
    worker_connections  1024;
}

http {

  include mime.types;
  default_type text/plain;

  client_body_temp_path /tmp 1 2;
  proxy_temp_path /tmp 1 2;
  fastcgi_temp_path /tmp 1 2;
  uwsgi_temp_path /tmp 1 2;
  scgi_temp_path /tmp 1 2;

  log_format time_combined '$remote_addr - $remote_user [$time_local]  '
                           '"$request" $status $body_bytes_sent '
                           '"$http_referer" "$http_user_agent" $request_time '
                           '"$http_x_forwarded_for"';

  access_log  "{{NGINX_LOGDIR}}/access.log time_combined buffer=2k";

  server_tokens off;

  aio off;
  directio off;
  sendfile off;
  gzip on;

  # Use large enough buffers for Content Security Policy support.
  fastcgi_buffers 16 16k;
  fastcgi_buffer_size 32k;

  # On the nginx version we have on F20 (nginx/1.4.7), nginx sends a malformed HTTP
  # response for 'Request-URI Too Large'
  # http://mailman.nginx.org/pipermail/nginx/2012-July/034578.html
  #
  # This is bad because styx considers this an error, and will mark the binding
  # unhealthy. As a workaround, we are going to bump this buffer
  # size to avoid hitting 'Request-URI Too Large'
  #
  large_client_header_buffers 4 32k;

  proxy_read_timeout 900s;
  fastcgi_read_timeout 900s;

  auth_basic_user_file  htpasswd;

  add_header X-Pantheon-Endpoint lando;

  map $http_user_agent $auth_basic_realm {
    default off;
    Photon/1.0 "off";
  }

  map $http_x_forwarded_proto $lando_https {
    default '';
    https on;
  }

  map $http_x_forwarded_proto $http_user_agent_https {
    default '';
    https ON;
  }

  include "{{NGINX_CONFDIR}}/vhosts/*.conf";

}
