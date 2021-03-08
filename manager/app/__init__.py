from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask import Flask, session
from flask_cors import CORS
import docker
from constants import LOCALIP

# The Docker SDK provides with 2 options for it's usage,
# The normal Client, and the Low Level Client.
# The main difference between those 2, is that low level client
# uses the REST API endpoint of docker, while the normal client
# uses the docker daemon directly, some operations need the low level 
# client.
# For more reference check: https://docker-py.readthedocs.io/en/stable/api.html

# client = docker.DockerClient(base_url='unix://var/run/docker.sock')
client = docker.DockerClient(base_url=LOCALIP + "/")
# lowlevel client.
dockercli = docker.APIClient(base_url=LOCALIP)

db = SQLAlchemy()
ma = Marshmallow()

# set all needed to create the app, without starting it.
def create_app(config_filename):
   
    # to prevent circular dependency problems, is needed to be imported,
    # only when creating the app.
    from blueprints import images, containers, services, login
    
    # APP SETUP
    app = Flask(__name__)
    # imports the configs from the Config file
    app.config.from_object(config_filename)
    CORS(app)

    # blueprints are the files in charge of routing the addresses
    # url_prefix indicates that, for example, /images is gonna be always
    # before any route indicated on it's blueprint.
    # @images_bp.route('/details') of images, is gonna be /images/deatils.
    app.register_blueprint(images.images_bp, url_prefix="/images")
    app.register_blueprint(containers.containers_bp, url_prefix="/containers")
    app.register_blueprint(services.services_bp)
    app.register_blueprint(login.login_bp)

    # init database.
    db.init_app(app)

    return app
