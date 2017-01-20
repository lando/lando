Kalabox Proxy
===================

A proxy server based on hipache

```

# Reverse proxy container for Kalabox
# docker build -t kalabox/proxy .
# docker run -d kalabox/proxy

FROM alpine:3.2

ENV S6_OVERLAY_VERSION v1.16.0.1
ENV NODE_ENV production

RUN \
  apk add --update bind-tools curl && \
  curl -sSL https://github.com/just-containers/s6-overlay/releases/download/${S6_OVERLAY_VERSION}/s6-overlay-amd64.tar.gz | tar xvfz - -C / && \
  apk del curl && \
  apk add --update nodejs redis openssl && \
  npm install --prefix=/usr/local -g https://github.com/thinktandem/hipache/tarball/0.4.4-kbox --production && \
  mkdir -p /var/log/hipache && \
  mkdir -p /certs && \
  rm -rf /var/cache/apk/*

ADD root /

VOLUME ["/var/lib/redis"]

EXPOSE 80
EXPOSE 443
EXPOSE 8160

ENTRYPOINT ["/init"]
CMD []

```
