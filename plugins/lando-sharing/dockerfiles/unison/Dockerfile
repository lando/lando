FROM debian:jessie

ENV UNISON_VERSION=2.49.543
ENV UNISON_CODEROOT=/code
ENV UNISON_WEBROOT=/var/www
ENV UNISON_OPTIONS=

RUN apt-get update && apt-get install -y \
    curl \
  && curl -fsSL -o /tmp/Release.key "http://download.opensuse.org/repositories/home:ocaml/xUbuntu_14.04/Release.key" \
  && apt-key add - < /tmp/Release.key \
  && sh -c "echo 'deb http://download.opensuse.org/repositories/home:/ocaml/xUbuntu_14.04/ /' >> /etc/apt/sources.list.d/ocaml.list" \
  && apt-get update -y \
  && apt-get install -y --force-yes \
    ocaml \
    build-essential \
    exuberant-ctags \
  && curl -fsSL -o /tmp/unison.tar.gz "http://www.seas.upenn.edu/~bcpierce/unison//download/releases/unison-$UNISON_VERSION/unison-$UNISON_VERSION.tar.gz" && \
    cd /tmp && tar -xzvf unison.tar.gz && \
    rm -rf unison.tar.gz && \
    cd src \
  && make UISTYLE=text && \
    cp -f unison /usr/local/bin && \
    cp -f unison-fsmonitor /usr/local/bin \
  && apt-get purge -y ocaml build-essential exuberant-ctags \
  && apt-get clean autoclean \
  && apt-get autoremove -y \
  && rm -rf /var/lib/{apt,dpkg,cache,log}/ /tmp/* /var/tmp/*

COPY sync.profile /root/.unison/default.prf
COPY run.sh /run.sh

CMD ["/run.sh"]
