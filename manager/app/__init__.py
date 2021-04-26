from flask_sqlalchemy import SQLAlchemy
from flask import Flask, session, render_template
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import docker
from constants import LOCALIP, USERNAME

client = docker.DockerClient(base_url=LOCALIP + "/")
dockercli = docker.APIClient(base_url=LOCALIP)

db = SQLAlchemy()
ma = Marshmallow()

def getExplicitErrorMessage(msg):
    start = msg.find('"') + 1
    end = msg.find('"', start)
    return msg[start:end]

def create_app(config_filename):
    from blueprints import images, containers, login, settings
    
    app = Flask(__name__)
    app.config.from_object(config_filename)
    CORS(app)

    app.register_blueprint(images.images_bp, url_prefix="/images")
    app.register_blueprint(containers.containers_bp, url_prefix="/containers")
    app.register_blueprint(settings.settings_bp, url_prefix="/settings")
    app.register_blueprint(login.login_bp)

    @app.route('/home')
    def main():
        return render_template('index.html', username=session[USERNAME])

    db.init_app(app)
    @app.before_first_request
    def before_first_request():
        from db_models import User
        try:
            default_admin = User('admin', 'admin', 2) 
            db.session.add(default_admin)
            db.session.commit()
        except Exception as ex:
            print('Admin already created, procceding normally.')

    return app

