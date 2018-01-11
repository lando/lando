# Shamelessly borrowed from Heroku
# see https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server

# A Single worker is simplest
workers Integer(ENV['WEB_CONCURRENCY'] || 1)
# We don't know if User's app is threadsafe, best to play it cool
threads_count = Integer(ENV['RAILS_MAX_THREADS'] || 1)
threads threads_count, threads_count

preload_app!

rackup      DefaultRackup
port        ENV['PORT']     || 80
environment ENV['RACK_ENV'] || 'development'

ssl_bind '0.0.0.0', '443', {
  key: '/certs/cert.key',
  cert: '/certs/cert.crt'
}

on_worker_boot do
  # Worker specific setup for Rails 4.1+
  # See: https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server#on-worker-boot
  ActiveRecord::Base.establish_connection

end
