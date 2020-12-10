import sys
import datetime
import requests
import simplejson as json
import docker
import os

from flask import Flask, request, jsonify, abort, render_template, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from flask_marshmallow import Marshmallow
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/manager.db'
app.config.update(
    DEBUG=True,
    JSON_SORT_KEYS=True,
    SQLALCHEMY_TRACK_MODIFICATIONS=False
)
db = SQLAlchemy(app)
ma = Marshmallow(app)

app.secret_key = '\xa8\xe8\xa4\xd0\x1f\xab-\xd5%\x0e\x0f/\xff\xddp\x08\x81 \xb60$\xe7NE'

# 192.168.1.148:2375 <-- original IP
# disys0.tamps.cinvestav.mx:2375 <-- IP Servidor
LOCALIP = "192.168.1.148:2375"
#LOCALIP = "unix://var/run/docker.sock"
# client = docker.DockerClient(base_url='http://192.168.1.87:2375/')
client = docker.DockerClient(base_url=LOCALIP + "/")
# lowlevel client.
dockercli = docker.APIClient(base_url=LOCALIP)
images = {
    "name": "http://localhost:5000",
    "endpoint": "/v2/_catalog",
    "children": []
}

USERCONTAINERS = 'usercontainers'
USERNAME = 'username'
USERID = 'userid'

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

class ContainerSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'image_id')

class UserContainersSchema(ma.Schema):
    class Meta:
        fields = ('id', 'user_id', 'container_id')
service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)
piece_schema = PieceSchema()
pieces_schema = PieceSchema(many=True)
user_schema = UserSchema()
users_schema = UserSchema(many=True)
container_schema= ContainerSchema()
containers_schema = ContainerSchema(many=True)

# load
def loadAllContainersOnDB():
    # make a route just to fill database once
    # but look up for a way to load the containers info
    # only once and not every time the systems loads.
    pass

# only to load containers on database, test purposes.s
@app.route('/loadDatabase')
def loadDatabase():
    allcontainers = client.containers.list(all=True)
    
    for c in allcontainers:
        print('container: ', c)
        containers = Container.query.all()
        new_container = Container(c.id, c.name, c.image.id)
        db.session.add(new_container)
        db.session.commit()

    return 'Containers loaded into DB!'

@app.route('/testdb')
def testdb():
    data = db.session.query( Container, User ).filter(
            UsersContainers.container_id == Container.id,
            UsersContainers.user_id == User.uid).order_by(UsersContainers.user_id).all();

    return {'data': data} 
# Raiz

@app.route('/home')
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

# ************* IMAGES ********************

@app.route('/image_builder')
def showImageBuilder():
    return render_template('image_builder.html')

@app.route('/image_details')
def showImageDetails():
    return render_template('image_details.html')

@app.route('/images/json')
def getAllImages():
    params = request.args
    images = dockercli.images(all=True)
    return { 'images': images }

def getTagsOf(repname, source):
    url = ''
    tags = []
    if(source == 'dockerhub'):
        # FROM DOCKERHUB, TAGS CAN BE OBTAINED WITH THE FOLLOW INSTRUCTION:
        url = 'https://registry.hub.docker.com/v1/repositories/{}/tags'.format(repname)
        data = requests.get(url).json()
        for t in data:
            tags.append(t['name'])
    else: 
        # FROM LOCAL REGISTRY, TAGS ARE OBTAINED WITH:
        url = 'http://localhost:5000/v2/{}/tags/list'.format(repname)
        data = requests.get(url).json();
        tags = data['tags']

    # Return only the array of tags
    return tags

@app.route('/registry')
def getImagesFromRegistry():
    source = request.args.get('source')
    text = request.args.get('text')
    repositories = []
    if(source == 'dockerhub'):
        repositories = client.images.search(text)
    else:
        repositories = requests.get('http://localhost:5000/v2/_catalog').json()['repositories']
       
    repsWithTags = dict()
    for rep in repositories:
        if(source == 'dockerhub'):
            repsWithTags[rep['name']] = { 
                    'automated': rep['is_automated'],
                    'official': rep['is_official'],
                    'name': rep['name'],
                    'description': rep['description'],
                    'stars': rep['star_count'],
                    'tags': getTagsOf(rep['name'], str(source))
            }
        else:
            repsWithTags[rep] = getTagsOf(rep, str(source))

    return { "repositories": repsWithTags }

@app.route('/images/delete', methods=["GET"])
def deleteImage():
    image = request.args.get('imagerepo')
    force = request.args.get('force') == 'true'
    noprune = request.args.get('noprune') == 'true' 
    msg = 'deleted'
    try: 
        client.images.remove(image=image, force=force, noprune=noprune) 
    except:
        msg = 'error'
    return msg

@app.route('/images/pull', methods=["GET"])
def pullImageFrom():
    repname = request.args.get('repname')
    source = request.args.get('source')
    image = client.images.pull(repname)

    imageid = ''

    if(source == 'dockerhub'):
        imageid = image.id
    else:
        imageid = image.id
 
    print('image id: ', imageid)
    return { 'id': imageid }


@app.route('/rep/<repname>/push/<id>')
def pushToRepo(repname, id):
    pass


@app.route('/images')
def listImages():
    return render_template('images.html')


def addContainerToUser(idcontainer):
    print('adding: ', idcontainer)
    print('to user: ', session[USERNAME])
    userContainer = UsersContainers(session[USERID], idcontainer)
    db.session.add(userContainer)
    db.session.commit()

# ************* CONTAINERS ********************

@app.route('/container_creation')
def showContainerCreation():
    images = getAllImages()
    return render_template('container_creation.html', images=images['images'])

@app.route('/containers/create', methods=['POST'])
def createContainer():
    data = request.json
    container = {}
   
    if('advancedCreation' in data):
        print('showing advanced parameters: ')
        ports = data['ports']
        if(not data['run']):
            container = client.containers.create(
                image = data['image'], 
                name = data['name'], 
                ports = data['ports'], 
                command = data['command'],
                tty = data['tty'], 
                hostname = data['hostname'],
                version = data['version'], 
                entrypoint = data['entrypoint'],
                working_dir = data['working_dir'],
                restart_policy = data['restart_policy'],
                labels = data['labels'],
                environment = data['environment'],
                detach = data['detach'],
                auto_remove = data['auto_remove'],
                read_only = data['read_only'],
                privileged = data['privileged'],
                publish_all_ports = data['publish_all_ports'],

                cgroup_parent = data['cgroup_parent'],
                cpu_count = data['cpu_count'],
                cpu_percent = data['cpu_percent'],
                cpu_period = data['cpu_period'],
                cpu_quota = data['cpu_quota'],
                cpu_rt_period = data['cpu_rt_period'],
                cpu_rt_runtime = data['cpu_rt_runtime'],
                cpu_shares = data['cpu_shares'],
                nano_cpus = data['nano_cpus'],
                cpuset_cpus = data['cpuset_cpus'],
                cpuset_mems = data['cpuset_mems'],
                mem_limit = data['mem_limit'],
                mem_reservation = data['mem_reservation'],
                mem_swappiness = data['mem_swappiness'],
                memswap_limit = data['memswap_limit'],
                blkio_weight_device = data['blkio_weight_device'],
                blkio_weight = data['blkio_weight'],
                network_disabled = data['network_disabled'],
                network = data['network'],
                network_mode = data['network_mode'],
                volume_driver = data['volume_driver'],
                volumes = data['volumes'],
                volumes_from = data['volumes_from'],
                mounts = data['mounts'],
                device_read_bps = data['device_read_bps'],
                device_read_iops = data['device_read_iops'],
                device_write_bps = data['device_write_bps'],
                device_write_iops = data['device_write_iops'],
                cap_add = data['cap_add'],
                cap_drop = data['cap_drop'],
                domainname = data['domainname'],
                init_path = data['init_path'],
                ipc_mode = data['ipc_mode'],
                isolation = data['isolation'],
                kernel_memory = data['kernel_memory'],
                mac_address = data['mac_address'],
                pid_mode = data['pid_mode'],
                # platform = data['platform'], apparently platform, and source are not valid paramters
                # maybe the version of python or docker is causing the problem.
                runtime = data['runtime'],
                shm_size = data['shm_size'],
                stop_signal = data['stop_signal'],
                userns_mode = data['userns_mode'],
                uts_mode = data['uts_mode'],
                device_cgroup_rules = data['device_cgroup_rules'],
                devices = data['devices'],
                device_requests = data['device_requests'],
                dns = data['dns'],
                dns_opt = data['dns_opt'],
                dns_search = data['dns_search'],
                group_add = data['group_add'],
                security_opt = data['security_opt'],
                ulimits = data['ulimits'],
                lxc_conf = data['lxc_conf'],
                healthcheck = data['healthcheck'],
                extra_hosts = data['extra_hosts'],
                links = data['links'],
                log_config = data['log_config'],
                storage_opt = data['storage_opt'],
                sysctls = data['sysctls'],
                tmpfs = data['tmpfs'],
                oom_kill_disable = data['oom_kill_disable'],
                init = data['init'],
                stdin_open = data['stdin_open'],
                # stream = data['stream'],
                use_config_proxy = data['use_config_proxy'],
                oom_score_adj = data['oom_score_adj'],
                pids_limit = data['pids_limit']
            )
            addContainerToUser(container.id)
        else:        
            container = client.containers.run(
                image = data['image'], 
                name = data['name'], 
                ports = data['ports'], 
                command = data['command'],
                tty = data['tty'], 
                hostname = data['hostname'],
                version = data['version'], 
                entrypoint = data['entrypoint'],
                working_dir = data['working_dir'],
                restart_policy = data['restart_policy'],
                labels = data['labels'],
                environment = data['environment'],
                detach = data['detach'],
                auto_remove = data['auto_remove'],
                read_only = data['read_only'],
                privileged = data['privileged'],
                publish_all_ports = data['publish_all_ports'],
                remove = data['remove'],
                cgroup_parent = data['cgroup_parent'],
                cpu_count = data['cpu_count'],
                cpu_percent = data['cpu_percent'],
                cpu_period = data['cpu_period'],
                cpu_quota = data['cpu_quota'],
                cpu_rt_period = data['cpu_rt_period'],
                cpu_rt_runtime = data['cpu_rt_runtime'],
                cpu_shares = data['cpu_shares'],
                nano_cpus = data['nano_cpus'],
                cpuset_cpus = data['cpuset_cpus'],
                cpuset_mems = data['cpuset_mems'],
                mem_limit = data['mem_limit'],
                mem_reservation = data['mem_reservation'],
                mem_swappiness = ['mem_swappiness'],
                memswap_limit = data['memswap_limit'],
                blkio_weight_device = data['blkio_weight_device'],
                blkio_weight = data['blkio_weight'],
                network_disabled = data['network_disabled'],
                network = data['network'],
                network_mode = data['network_mode'],
                volume_driver = data['volume_driver'],
                volumes = data['volumes'],
                volumes_from = data['volumes_from'],
                mounts = data['mounts'],
                device_read_bps = data['device_read_bps'],
                device_read_iops = data['device_read_iops'],
                device_write_bps = data['device_write_bps'],
                device_write_iops = data['device_write_iops'],
                cap_add = data['cap_add'],
                cap_drop = data['cap_drop'],
                domainname = data['domainname'],
                init_path = data['init_path'],
                ipc_mode = data['ipc_mode'],
                isolation = data['isolation'],
                kernel_memory = data['kernel_memory'],
                mac_address = data['mac_address'],
                pid_mode = data['pid_mode'],
                platform = data['platform'],
                runtime = data['runtime'],
                shm_size = data['shm_size'],
                stop_signal = data['stop_signal'],
                userns_mode = data['userns_mode'],
                uts_mode = data['uts_mode'],
                device_cgroup_rules = data['device_cgroup_rules'],
                devices = data['devices'],
                device_requests = data['device_requests'],
                dns = data['dns'],
                dns_opt = data['dns_opt'],
                dns_search = data['dns_search'],
                group_add = data['group_add'],
                security_opt = data['security_opt'],
                ulimits = data['ulimits'],
                lxc_conf = data['lxc_conf'],
                healthcheck = data['healthcheck'],
                extra_hosts = data['extra_hosts'],
                links = data['links'],
                log_config = data['log_config'],
                storage_opt = data['storage_opt'],
                sysctls = data['sysctls'],
                tmpfs = data['tmpfs'],
                oom_kill_disable = data['oom_kill_disable'],
                init = data['init'],
                stdin_open = data['stdin_open'],
                stdout = data['stdout'],
                stderr = data['stderr'],
                stream = data['stream'],
                use_config_proxy = data['use_config_proxy'],
                oom_score_adj = data['oom_score_adj'],
                pids_limit = data['pids_limit']
            )
            print('running container: ', container)
            addContainerToUser(container.id)
    else:
        volumeData = data['volume'].split(':')
        volume = {}
        volume[volumeData[0]] = {
            'bind': volumeData[1],
            'mode': volumeData[2] if volumeData[2] != None else ''
        }
        ports = data['ports'].split(':')
        ports = { ports[0]: ports[1] }

        container = client.containers.create(image=data['image'],name=data['name'],ports=ports,command=data['command'], tty=data['tty'], volumes=volume)
        addContainerToUser(container.id)
    
    # if run after create is marked, start the container
    if(data['run']):
        container.start()
    # Add container info to database
    new_container = Container(container.id, container.name, container.image.id)
    db.session.add(new_container)
    db.session.commit()
    # add recently created container to user session containers array.
    session[USERCONTAINERS].append(container.id)

    return container.short_id

@app.route('/container_details')
def showContainerDetails():
    return render_template('container_details.html')

@app.route('/containers/json')
def getContainers():
    containers = dockercli.containers(all=True)
    containers = filter(lambda c: c['Id'] in session[USERCONTAINERS], containers) 
    return {'containers': containers}

@app.route('/containers')
def listContainers():
    # list containers only of the given user.
    containerslist = getContainers()['containers']

    # allcontainers = client.containers.list(all=True);
    # formattedContainers = map(containerToJson, allcontainers)
    jsonArray = { "containers": containerslist }
    return render_template('containers.html', containers=json.dumps(jsonArray))

# Function to map Containers objet to json, in order to use themo on JS
def containerToJson(container):
    image = {"id": container.image.id, "tags": container.image.tags}
    c = {"id": container.short_id, "name": container.name, "status": container.status, "image": image}
    return json.dumps(c)

@app.route('/containers/<id>')
def getContainerInfo(id):
    return {"contaienrinfo": 'Hello {id}'}

@app.route('/containers/start/<id>')
def startContainer(id):
    dockercli.start(id)
    return 'running'

@app.route('/containers/stop/<id>')
def stopContainer(id):
    dockercli.stop(id)
    return 'running'

@app.route('/containers/restart/<id>')
def restartContainer(id):
    dockercli.restart(id)
    return 'running'

@app.route('/containers/pause/<id>')
def pauseContainer(id):
    dockercli.pause(id)
    return 'running'

@app.route('/containers/unpause/<id>')
def unpauseContainer(id):
    dockercli.unpause(id)
    return 'running'

@app.route('/', methods=['GET'])
def loginscreen():
    return render_template('signin.html')

@app.route('/login', methods=['POST'])
def login():
    params = request.form;
    if(len(params) > 0):
        # authenticate
        username = params.get('username')
        password = params.get('password')

        exists = authenticate(username, password)
        if(exists): 
            session[USERNAME] = username

            userContainers = db.session.query(Container, User).filter(
                    UsersContainers.container_id == Container.id,
                    UsersContainers.user_id == User.uid).order_by(UsersContainers.user_id).all()
            session[USERCONTAINERS] = []
            for x in userContainers:
                session[USERCONTAINERS].append(x.Container.id)

            return main()
        else:
            return 'User doesnt exists.'
    else:
        return render_template('signin.html')

    return 'Failed to authentiate'

def authenticate(username, password):
    allusers = User.query.all()
    for user in allusers:
        if(user.username == username and user.password == password):
            session[USERID] = user.uid
            return True
    
    return False

@app.route('/signup', methods=['POST'])
def signup():
    params = request.form;
    if(len(params) > 0):
        username = params.get('username')
        password = params.get('password')

        exists = authenticate(username, password)

        if(exists):
            return { 'error': 'User already exists, login instead'}
        else:
            session[USERNAME] = username
            # insert to db user, and login
            user = User(username, password)
            
            db.session.add(user)
            db.session.commit()
            return main()

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

    return headers


def getSilo(headers):
    try:
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
        print("usage: %s port" % (sys.argv[0]))
        sys.exit(-1)

    p = int(sys.argv[1])
    print("start at port %s" % (p))
    app.run(host='0.0.0.0', port=p, debug=True, threaded=True)
