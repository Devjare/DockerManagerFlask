from sqlalchemy import ForeignKey
from app import db, ma

##### MODELS #####
class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255))
    image = db.Column(db.String(255))
    replicas = db.Column(db.Integer)

    def __init__(self, id, name, image, replicas):
        self.id = id
        self.name = name
        self.image = image
        self.replicas = replicas

class Piece(db.Model):
    __tablename__ = 'pieces'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    host = db.Column(db.String(255))

    def __init__(self, id, name, host):
        self.id = id
        self.name = name
        self.host = host

    def __repr__(self):
        return '<UC %d>' % self.id


class User(db.Model):
    __tablename__ = 'users'
    uid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(255))
    password = db.Column(db.String(255))

    containers = db.relationship('Container', secondary='users_containers')

    def __init__(self, username, password):
        self.username = username
        self.password = password

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


##### SCHEMAS #####
class ServiceSchema(ma.Schema):
    class Meta:
        # Fields to expose
        fields = ('id', 'name', 'image', 'replicas')
    #id = fields.Str()
    #name = fields.Str()
    #image = fields.Str()
    #replicas = fields.Int()

    #@post_dump
    #def wrap_with_envelope(self, in_data):
    #    in_data['image'] = in_data['image'].split('/')[1]
    #    return in_data

class PieceSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'host')
    #id = fields.Int()
    #name = fields.Str()
    #host = fields.Str()

class UserSchema(ma.Schema):
    class Meta:
        fields = ('uid', 'username', 'password')

service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)
piece_schema = PieceSchema()
pieces_schema = PieceSchema(many=True)
