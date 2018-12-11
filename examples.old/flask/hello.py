from flask import Flask
from livereload import Server, shell

# Basic Flask app
app = Flask(__name__)

# remember to use DEBUG mode for templates auto reload
# https://github.com/lepture/python-livereload/issues/144
app.debug = True

# Flask route
@app.route('/')
def hello_world():
    return 'Drinks from the flask'

# Live reload server
# Prob want to set some sort of env flag to only do this on DEV
server = Server(app.wsgi_app)

# use custom host and port
server.serve(port=80, host='0.0.0.0')
