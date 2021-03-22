from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask import Flask, session
from flask_cors import CORS
import docker
from constants import LOCALIP

client = docker.DockerClient(base_url=LOCALIP + "/")
dockercli = docker.APIClient(base_url=LOCALIP)

db = SQLAlchemy()
ma = Marshmallow()

def create_app(config_filename):
    from blueprints import images, containers, login
    
    app = Flask(__name__)
    app.config.from_object(config_filename)
    CORS(app)

    app.register_blueprint(images.images_bp, url_prefix="/images")
    app.register_blueprint(containers.containers_bp, url_prefix="/containers")
    app.register_blueprint(login.login_bp)

    db.init_app(app)

    return app
