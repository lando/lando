# Rails Image with nodejs and MySQL/Postgres clients
#
# docker build -t devwithlando/ruby:2.4-rails .

FROM ruby:2.4

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        mysql-client \
        postgresql-client \
        nodejs \
    && rm -rf /var/lib/apt/lists/*
