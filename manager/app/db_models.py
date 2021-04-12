from sqlalchemy import ForeignKey
from app import db

class User(db.Model):
    __tablename__ = 'users'
    uid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(255))
    password = db.Column(db.String(255))
    role = db.Column(db.Integer)

    containers = db.relationship('Container', secondary='users_containers')

    def __init__(self, username, password, role):
        self.username = username
        self.password = password
        self.role = role

class Container(db.Model):
    __tablename__ = 'containers'
    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255)) 
    image_id = db.Column(db.String(255))

    users = db.relationship('User', secondary='users_containers')

    def __init__(self, id, name, image_id):
        self.id = id
        self.name = name
        self.image_id = image_id

class UsersContainers(db.Model):
    __tablename__ = 'users_containers'
    id = db.Column(db.String(255), primary_key=True)
    user_id = db.Column(db.Integer, 
            ForeignKey('containers.id'),
            primary_key=True)
    container_id = db.Column(db.String(255),
            ForeignKey('users.uid'),
            primary_key=True)

    def __init__(self, user_id, container_id):
        self.user_id = user_id
        self.container_id = container_id

