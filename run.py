import sys
import datetime
import requests
import simplejson as json
import docker

from flask import Flask, request, jsonify, abort, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/manager.db'
app.config.update(
    DEBUG=True,
    JSON_SORT_KEYS=True,
    SQLALCHEMY_TRACK_MODIFICATIONS=False
)
db = SQLAlchemy(app)
ma = Marshmallow(app)

# 192.168.1.148:2375 <-- original IP
LOCALIP = "unix://var/run/docker.sock"
# client = docker.DockerClient(base_url='http://192.168.1.87:2375/')
client = docker.DockerClient(base_url=LOCALIP + "/")

images = {
    "name": "http://localhost:5000",
    "endpoint": "/v2/_catalog",
    "children": []
}

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

service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)
piece_schema = PieceSchema()
pieces_schema = PieceSchema(many=True)

# Raiz

@app.route('/')
@app.route('/index.html')
def main():
    return render_template('index.html')


@app.route('/health')
def health():
    return 'El gestor global es saludable'

# Interfaz grafica
@app.route('/silo')
def silo():
    headers = getForwardHeaders(request)
    user = request.cookies.get("user", "")
    (siloStatus, images) = getSilo(headers)
    return render_template(
        'silo.html',
        siloStatus=siloStatus,
        images=images,
        user=user)


@app.route('/unidades')
def units():
    return render_template(
        'uc.html')


@app.route('/subservicios')
def subservices():
    return render_template(
        'sv.html')


@app.route('/definicion')
def planning():
    headers = getForwardHeaders(request)
    user = request.cookies.get("user", "")
    (siloStatus, images) = getSilo(headers)
    return render_template(
        'planificacion.html',
        siloStatus=siloStatus,
        images=images,
        user=user)


@app.route('/representacion')
def picture():
    return render_template(
        'planificacion.html')


@app.route('/despliegue')
def deployment():
    return render_template(
        'planificacion.html')


@app.route('/acoplamiento')
def coupling():
    return render_template(
        'planificacion.html')

@app.route('/containers')
def listContainers():
    return render_template('containers.html')

@app.route('/signin')
def signin():
    return render_template('signin.html')

# API

# Obtengo las images del SILO
@app.route('/api/v1/images')
def getImages():
    return json.dumps(getImagesSilo()), 200, {'Content-Type': 'application/json'}



# Funciones llamadas por el API

def getForwardHeaders(request):
    headers = {}

    user_cookie = request.cookies.get("user")
    if user_cookie:
        headers['Cookie'] = 'user=' + user_cookie

    incoming_headers = ['x-request-id',
                        'x-b3-traceid',
                        'x-b3-spanid',
                        'x-b3-parentspanid',
                        'x-b3-sampled',
                        'x-b3-flags',
                        'x-ot-span-context'
                        ]

    for ihdr in incoming_headers:
        val = request.headers.get(ihdr)
        if val is not None:
            headers[ihdr] = val
            #print "incoming: "+ihdr+":"+val

    return headers


def getSilo(headers):
    print "GETSILO METHOD~~~~~~~~~~~~~~~~~~~~~~~"
    try:
        print "Trying to get Images..........."
        url = images['name'] + images['endpoint']
        res = requests.get(url, headers=headers, timeout=3.0)
    except:
        res = None
    if res and res.status_code == 200:
        return (200, res.json())
    else:
        status = (res.status_code if res != None and res.status_code else 500)
        return (status, {'error': 'Lo sentimos, las unidades de construccion no estan disponible en este momento.'})


def getImagesSilo():
    try:
        url = images['name'] + "/" + images['endpoint']
        res = requests.get(url, timeout=3.0)
    except:
        res = None
    if res and res.status_code == 200:
        return res.json()
    else:
        return ({'error': 'Lo sentimos, las unidades de construccion no estan disponible en este momento.'})


##### API #####

# Crea un servicio
@app.route("/api/v1/service/create/", methods=["POST"])
def add_service():
    
    id = request.json['id']
    name = request.json['name']
    image = request.json['image']
    replicas = request.json['replicas']
    
    new_service = Service(id, name, image, replicas)
    
    db.session.add(new_service)
    db.session.commit()
    
    return jsonify({"message": "Created new service.",
                    "id": new_service.id})

# Obtiene los servicios


@app.route("/api/v1/services/", methods=["GET"])
def get_services():
    all_services = Service.query.all()
    result = services_schema.dump(all_services)
    return jsonify({"services": result.data})

# Obtiene la informacion de un servicio


@app.route("/api/v1/service/<id>", methods=["GET"])
def service_detail(id):
    service = Service.query.get(id)
    #result = service_schema.dump(service)
    #return jsonify(result)
    return service_schema.jsonify(service)

# Elimina un servicio
@app.route("/api/v1/service/<id>", methods=["DELETE"])
def service_delete(id):
    service = Service.query.get(id)
    db.session.delete(service)
    db.session.commit()

    #service = client.services.get(id)
    #service.remove()
    return jsonify({"message": "Deleted service.",
                    "id": id})

# Registro de UC
@app.route("/api/v1/register/", methods=["POST"])
def add_uc():
    id = request.json['id']
    name = request.json['name']
    host = request.json['host']
    
    new_piece = Piece(id, name, host)
    
    db.session.add(new_piece)
    db.session.commit()
    
    return jsonify({"message": "Register new UC.",
                    "id": new_piece.id})


@app.route("/api/v1/uc/")
def get_uc():
    pieces = Piece.query.all()
    result = piece_schema.dump(pieces)
    return jsonify({"ucs": result.data})

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print "usage: %s port" % (sys.argv[0])
        sys.exit(-1)

    p = int(sys.argv[1])
    print "start at port %s" % (p)
    app.run(host='0.0.0.0', port=p, debug=True, threaded=True)
