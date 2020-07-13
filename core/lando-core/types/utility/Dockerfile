# Basic util container for lando
#
# docker build -t devwithlando/util:stable .

FROM debian:jessie

# Install dependencies we need
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    ssh \
    git-core \
    bzip2 \
  && apt-get -y clean \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/* && rm -rf && rm -rf /var/lib/cache/* && rm -rf /var/lib/log/* && rm -rf /tmp/*
