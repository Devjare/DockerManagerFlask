from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask import Flask, session
from flask_cors import CORS
import docker

# disys0.tamps.cinvestav.mx:2375 <-- IP Servidor
#LOCALIP = "unix://var/run/docker.sock"
LOCALIP = "192.168.1.198:2375"

# client = docker.DockerClient(base_url='http://192.168.1.87:2375/')
client = docker.DockerClient(base_url=LOCALIP + "/")

# lowlevel client.
dockercli = docker.APIClient(base_url=LOCALIP)

# CONSTANTS
USERCONTAINERS = 'usercontainers'
USERNAME = 'username'
USERID = 'userid'

# APP SETUP
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/manager.db'
app.config.update(
    DEBUG=True,
    JSON_SORT_KEYS=True,
    SQLALCHEMY_TRACK_MODIFICATIONS=False)
db = SQLAlchemy(app)
ma = Marshmallow(app)

app.secret_key = '\xa8\xe8\xa4\xd0\x1f\xab-\xd5%\x0e\x0f/\xff\xddp\x08\x81 \xb60$\xe7NE'
