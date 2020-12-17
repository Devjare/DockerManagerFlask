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

@app.route('/home')
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

@app.route('/images/inspect/<id>', methods=["GET"])
def getImageInfo(id):
    image = {}
    try:
        image = dockercli.inspect_image(id)
    except docker.errors.APIError as err:
        return { "error": err }
    return {"image": image} 

# ************* CONTAINERS ********************

@app.route('/container_creation')
def showContainerCreation():
    images = getAllImages()
    return render_template('container_creation.html', images=images['images'])

@app.route('/containers/create', methods=['POST'])
def createContainer():
    data = request.json
    container = {}
  
    # if the parameters is not on the data from client object
    # then it's gonna be passed as None(null for docker)
    if('advancedCreation' in data):
        print('data: ', data);
        if(not data['run']):
            print('create without running')
            try:
                container = client.containers.create(
                    image = data['image'], 
                    name = data['name'] if 'name' in data else None, 
                    ports = data['ports'] if 'ports' in data else None, 
                    command = data['command'] if 'command' in data else None,
                    tty = data['tty'] if 'tty' in data else None, 
                    hostname = data['hostname'] if 'hostname' in data else None,
                    version = data['version'] if 'version' in data else None, 
                    entrypoint = data['entrypoint'] if 'entrypoint' in data else None,
                    working_dir = data['working_dir'] if 'working_dir' in data else None,
                    restart_policy = data['restart_policy'] if 'restart_policy' in data else None,
                    labels = data['labels'] if 'labels' in data else None,
                    environment = data['environment'] if 'environment' in data else None,
                    detach = data['detach'] if 'detach' in data else None,
                    auto_remove = data['auto_remove'] if 'auto_remove' in data else None,
                    read_only = data['read_only'] if 'read_only' in data else None,
                    privileged = data['privileged'] if 'privileged' in data else None,
                    publish_all_ports = data['publish_all_ports'] if 'publish_all_ports' in data else None,

                    cgroup_parent = data['cgroup_parent'] if 'cgroup_parent' in data else None,
                    cpu_count = int(data['cpu_count']) if 'cpu_count' in data else None,
                    cpu_percent = int(data['cpu_percent']) if 'cpu_percent' in data else None,
                    cpu_period = int(data['cpu_period']) if 'cpu_period' in data else None,
                    cpu_quota = int(data['cpu_quota']) if 'cpu_quota' in data else None,
                    cpu_rt_period = int(data['cpu_rt_period']) if 'cpu_rt_period' in data else None,
                    cpu_rt_runtime = int(data['cpu_rt_runtime']) if 'cpu_rt_runtime' in data else None,
                    cpu_shares = int(data['cpu_shares']) if 'cpu_shares' in data else None,
                    nano_cpus = int(data['nano_cpus']) if 'nano_cpus' in data else None,
                    cpuset_cpus = data['cpuset_cpus'] if 'cpuset_cpus' in data else None,
                    cpuset_mems = str(data['cpuset_mems']) if 'cpuset_mems' in data else None,
                    mem_limit = data['mem_limit'] if 'mem_limit' in data else None,
                    mem_reservation = data['mem_reservation'] if 'mem_reservation' in data else None,
                    mem_swappiness = int(data['mem_swappiness']) if 'mem_swappiness' in data else None,
                    memswap_limit = data['memswap_limit'] if 'memswap_limit' in data else None,
                    blkio_weight_device = data['blkio_weight_device'] if 'blkio_weight_device' in data else None,
                    blkio_weight = data['blkio_weight'] if 'blkio_weight' in data else None,
                    network_disabled = data['network_disabled'] if 'network_disabled' in data else None,
                    network = data['network'] if 'network' in data else None,
                    network_mode = data['network_mode'] if 'network_mode' in data else None,
                    volume_driver = data['volume_driver'] if 'volume_driver' in data else None,
                    volumes = data['volumes'] if 'volumes' in data else None,
                    volumes_from = data['volumes_from'] if 'volumes_from' in data else None,
                    mounts = data['mounts'] if 'mounts' in data else None,
                    device_read_bps = data['device_read_bps'] if 'device_read_bps' in data else None,
                    device_read_iops = data['device_read_iops'] if 'device_read_iops' in data else None,
                    device_write_bps = data['device_write_bps'] if 'device_write_bps' in data else None,
                    device_write_iops = data['device_write_iops'] if 'device_write_iops' in data else None,
                    cap_add = data['cap_add'] if 'cap_add' in data else None,
                    cap_drop = data['cap_drop'] if 'cap_drop' in data else None,
                    domainname = data['domainname'] if 'domainname' in data else None,
                    init_path = data['init_path'] if 'init_path' in data else None,
                    ipc_mode = data['ipc_mode'] if 'ipc_mode' in data else None,
                    isolation = data['isolation'] if 'isolation' in data else None,
                    kernel_memory = data['kernel_memory'] if 'kernel_memory' in data else None,
                    mac_address = data['mac_address'] if 'mac_address' in data else None,
                    pid_mode = data['pid_mode'] if 'pid_mode' in data else None,
                    # platform = data['platform'], apparently platform, and stream are not valid paramters
                    # maybe the version of python or docker is causing the problem.
                    runtime = data['runtime'] if 'runtime' in data else None,
                    shm_size = data['shm_size'] if 'shm_size' in data else None,
                    stop_signal = data['stop_signal'] if 'stop_signal' in data else None,
                    userns_mode = data['userns_mode'] if 'userns_mode' in data else None,
                    uts_mode = data['uts_mode'] if 'uts_mode' in data else None,
                    device_cgroup_rules = data['device_cgroup_rules'] if 'device_cgroup_rules' in data else None,
                    devices = data['devices'] if 'devices' in data else None,
                    device_requests = data['device_requests'] if 'device_requests' in data else None,
                    dns = data['dns'] if 'dns' in data else None,
                    dns_opt = data['dns_opt'] if 'dns_opt' in data else None,
                    dns_search = data['dns_search'] if 'dns_search' in data else None,
                    group_add = data['group_add'] if 'group_add' in data else None,
                    security_opt = data['security_opt'] if 'security_opt' in data else None,
                    ulimits = data['ulimits'] if 'ulimits' in data else None,
                    lxc_conf = data['lxc_conf'] if 'lxc_conf' in data else None,
                    healthcheck = data['healthcheck'] if 'healthcheck' in data else None,
                    extra_hosts = data['extra_hosts'] if 'extra_hosts' in data else None,
                    links = data['links'] if 'links' in data else None,
                    log_config = data['log_config'] if 'log_config' in data else None,
                    storage_opt = data['storage_opt'] if 'storage_opt' in data else None,
                    sysctls = data['sysctls'] if 'sysctls' in data else None,
                    tmpfs = data['tmpfs'] if 'tmpfs' in data else None,
                    oom_kill_disable = data['oom_kill_disable'] if 'oom_kill_disable' in data else None,
                    init = data['init'] if 'init' in data else None,
                    stdin_open = data['stdin_open'] if 'stdin_open' in data else None,
                    # stream = data['stream'],
                    use_config_proxy = data['use_config_proxy'] if 'use_config_proxy' in data else None,
                    oom_score_adj = int(data['oom_score_adj']) if 'oom_score_adj' in data else None,
                    pids_limit = int(data['pids_limit']) if 'pids_limit' in data else None
                )
                print('created container', container)
                addContainerToUser(container.id)
            except docker.errors.APIError as api_error:
                print('error: ', api_error)
                return { 'error': api_error }
            except docker.errors.ImageNotFound as error:
                return { 'error': error }
        else:        
            print('create running')
            try:
                container = client.containers.create(
                    image = data['image'], 
                    name = data['name'] if 'name' in data else None, 
                    ports = data['ports'] if 'ports' in data else None, 
                    command = data['command'] if 'command' in data else None,
                    tty = data['tty'] if 'tty' in data else None, 
                    hostname = data['hostname'] if 'hostname' in data else None,
                    version = data['version'] if 'version' in data else None, 
                    entrypoint = data['entrypoint'] if 'entrypoint' in data else None,
                    working_dir = data['working_dir'] if 'working_dir' in data else None,
                    restart_policy = data['restart_policy'] if 'restart_policy' in data else None,
                    labels = data['labels'] if 'labels' in data else None,
                    environment = data['environment'] if 'environment' in data else None,
                    detach = data['detach'] if 'detach' in data else None,
                    auto_remove = data['auto_remove'] if 'auto_remove' in data else None,
                    read_only = data['read_only'] if 'read_only' in data else None,
                    privileged = data['privileged'] if 'privileged' in data else None,
                    publish_all_ports = data['publish_all_ports'] if 'publish_all_ports' in data else None,
                    cgroup_parent = data['cgroup_parent'] if 'cgroup_parent' in data else None,
                    cpu_count = int(data['cpu_count']) if 'cpu_count' in data else None,
                    cpu_percent = int(data['cpu_percent']) if 'cpu_percent' in data else None,
                    cpu_period = int(data['cpu_period']) if 'cpu_period' in data else None,
                    cpu_quota = int(data['cpu_quota']) if 'cpu_quota' in data else None,
                    cpu_rt_period = int(data['cpu_rt_period']) if 'cpu_rt_period' in data else None,
                    cpu_rt_runtime = int(data['cpu_rt_runtime']) if 'cpu_rt_runtime' in data else None,
                    cpu_shares = int(data['cpu_shares']) if 'cpu_shares' in data else None,
                    nano_cpus = int(data['nano_cpus']) if 'nano_cpus' in data else None,
                    cpuset_cpus = data['cpuset_cpus'] if 'cpuset_cpus' in data else None,
                    cpuset_mems = str(data['cpuset_mems']) if 'cpuset_mems' in data else None,
                    mem_limit = data['mem_limit'] if 'mem_limit' in data else None,
                    mem_reservation = data['mem_reservation'] if 'mem_reservation' in data else None,
                    mem_swappiness = int(data['mem_swappiness']) if 'mem_swappiness' in data else None,
                    memswap_limit = data['memswap_limit'] if 'memswap_limit' in data else None,
                    blkio_weight_device = data['blkio_weight_device'] if 'blkio_weight_device' in data else None,
                    blkio_weight = data['blkio_weight'] if 'blkio_weight' in data else None,
                    network_disabled = data['network_disabled'] if 'network_disabled' in data else None,
                    network = data['network'] if 'network' in data else None,
                    network_mode = data['network_mode'] if 'network_mode' in data else None,
                    volume_driver = data['volume_driver'] if 'volume_driver' in data else None,
                    volumes = data['volumes'] if 'volumes' in data else None,
                    volumes_from = data['volumes_from'] if 'volumes_from' in data else None,
                    mounts = data['mounts'] if 'mounts' in data else None,
                    device_read_bps = data['device_read_bps'] if 'device_read_bps' in data else None,
                    device_read_iops = data['device_read_iops'] if 'device_read_iops' in data else None,
                    device_write_bps = data['device_write_bps'] if 'device_write_bps' in data else None,
                    device_write_iops = data['device_write_iops'] if 'device_write_iops' in data else None,
                    cap_add = data['cap_add'] if 'cap_add' in data else None,
                    cap_drop = data['cap_drop'] if 'cap_drop' in data else None,
                    domainname = data['domainname'] if 'domainname' in data else None,
                    init_path = data['init_path'] if 'init_path' in data else None,
                    ipc_mode = data['ipc_mode'] if 'ipc_mode' in data else None,
                    isolation = data['isolation'] if 'isolation' in data else None,
                    kernel_memory = data['kernel_memory'] if 'kernel_memory' in data else None,
                    mac_address = data['mac_address'] if 'mac_address' in data else None,
                    pid_mode = data['pid_mode'] if 'pid_mode' in data else None,
                    # platform = data['platform'] if 'platform' in data else None,
                    runtime = data['runtime'] if 'runtime' in data else None,
                    shm_size = data['shm_size'] if 'shm_size' in data else None,
                    stop_signal = data['stop_signal'] if 'stop_signal' in data else None,
                    userns_mode = data['userns_mode'] if 'userns_mode' in data else None,
                    uts_mode = data['uts_mode'] if 'uts_mode' in data else None,
                    device_cgroup_rules = data['device_cgroup_rules'] if 'device_cgroup_rules' in data else None,
                    devices = data['devices'] if 'devices' in data else None,
                    device_requests = data['device_requests'] if 'device_requests' in data else None,
                    dns = data['dns'] if 'dns' in data else None,
                    dns_opt = data['dns_opt'] if 'dns_opt' in data else None,
                    dns_search = data['dns_search'] if 'dns_search' in data else None,
                    group_add = data['group_add'] if 'group_add' in data else None,
                    security_opt = data['security_opt'] if 'security_opt' in data else None,
                    ulimits = data['ulimits'] if 'ulimits' in data else None,
                    lxc_conf = data['lxc_conf'] if 'lxc_conf' in data else None,
                    healthcheck = data['healthcheck'] if 'healthcheck' in data else None,
                    extra_hosts = data['extra_hosts'] if 'extra_hosts' in data else None,
                    links = data['links'] if 'links' in data else None,
                    log_config = data['log_config'] if 'log_config' in data else None,
                    storage_opt = data['storage_opt'] if 'storage_opt' in data else None,
                    sysctls = data['sysctls'] if 'sysctls' in data else None,
                    tmpfs = data['tmpfs'] if 'tmpfs' in data else None,
                    oom_kill_disable = data['oom_kill_disable'] if 'oom_kill_disable' in data else None,
                    init = data['init'] if 'init' in data else None,
                    stdin_open = data['stdin_open'] if 'stdin_open' in data else None,
                    # stream = data['stream'] if 'stream' in data else None,
                    use_config_proxy = data['use_config_proxy'] if 'use_config_proxy' in data else None,
                    oom_score_adj = int(data['oom_score_adj']) if 'oom_score_adj' in data else None,
                    pids_limit = int(data['pids_limit']) if 'pids_limit' in data else None
                 )
                 # since run() doesnt return the new created container id, 
                 # make a query to look up for the last created container on API

                print('created container', container)
                addContainerToUser(container.id)
            except docker.errors.APIError as api_error:
                # since there's no way on knowing on client side, what caused the error
                # just return that there was an error, hoping for the sdk to implement something
                # for that.
                print('error: ', api_error)
                return { 'error': api_error }
            except docker.errors.ImageNotFound as error:
                return { 'error': error }
    else:
        # if not advanced
        print('basic data: ', data)
        volumeData = data['volume'].split(':') if 'volume' in data else None
        volume = None
        if(volumeData != None):
            volume[volumeData[0]] = {
                'bind': volumeData[1],
                'mode': volumeData[2] if volumeData[2] != None else ''
            }
        
        ports = data['ports'].split(':') if 'ports' in data else None
        ports = { ports[0]: ports[1] } if ports != None else None

        command = data['command'] if 'command' in data else None

        container = client.containers.create(image=data['image'],name=data['name'],ports=ports,command=command, tty=data['tty'], volumes=volume)
        addContainerToUser(container.id)
   
    if(data['run']):
        container.start()
    # Add container info to database
    new_container = Container(container.id, container.name, container.image.id)
    db.session.add(new_container)
    db.session.commit()
    # add recently created container to user session containers array.
    session[USERCONTAINERS].append(container.id)

    return { 'containerid': container.short_id }

@app.route('/containers/delete', methods=["GET"])
def deleteContainer():
    container = request.args.get('container')
    volumes = request.args.get('volumes')
    links = request.args.get('links')
    force = request.args.get('force')
    try:
        container = client.containers.get(str(container))
        print('containerid: ', container.id);
        
        # delete from db, Container
        containerDb = Container.query.get(container.id)
        db.session.delete(containerDb)
        
        # delete row on UserContainerTable
        usercontainer = UsersContainers.query.filter_by(user_id=session[USERID], container_id=container.id).first()
        print('usercontainer to delete: ', usercontainer)
        print('usercontainer to delete: ', usercontainer.id)
        db.session.delete(usercontainer)
        db.session.commit()

        # remove on docker
        container.remove(v=volumes, link=links, force=force)
    except docker.errors.ImageNotFound as e: 
        return { 'error': True }
    except docker.errors.APIError as e: 
        return { 'error': True }

    return { 'deleted': True }

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

@app.route('/containers/inspect/<id>', methods=["GET"])
def getContainerInfo(id):
    container = {}
    try:
        container = dockercli.inspect_container(id)
    except docker.errors.APIError as err:
        return { "error": err }
    return {"container": container} 

@app.route('/containers/start/<id>')
def startContainer(id):
    try:
        dockercli.start(id)
    except docker.errors.APIError as err:
        return { 'error': err }
    return { 'started': True }

@app.route('/containers/stop/<id>')
def stopContainer(id):
    try:
        dockercli.stop(id)
    except docker.errors.APIError as err:
        return { 'error': err }
    return { 'stopped': True }

@app.route('/containers/restart/<id>')
def restartContainer(id):
    try:
        dockercli.restart(id)
    except docker.errors.APIError as err:
        return { 'error': err }
    return { 'restarting': True }

@app.route('/containers/pause/<id>')
def pauseContainer(id):
    try:
        dockercli.pause(id)
    except docker.errors.APIError as err:
        return { 'error': err }
    return { 'paused': True }

@app.route('/containers/unpause/<id>')
def unpauseContainer(id):
    try:
        dockercli.unpause(id)
    except docker.errors.APIError as err:
        return { 'error': err }
    return { 'unpaused': True }

@app.route('/', methods=['GET'])
def loginscreen():
    return render_template('signin.html')

@app.route('/logout', methods=['GET'])
def logout():
    [session.pop(key) for key in list(session.keys())]
    return loginscreen();

@app.route('/login', methods=['POST'])
def login():
    params = request.json;
    
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

            return { 'login': True } 
        else:
            return { 'error': 'User does not exist' } 

    return { 'error': 'An error occurred, failed to authenticate.' } 

def authenticate(username, password):
    allusers = User.query.all()
    for user in allusers:
        if(user.username == username and user.password == password):
            session[USERID] = user.uid
            return True
    
    return False

@app.route('/signup', methods=['POST'])
def signup():
    params = request.json;
    
    if(len(params) > 0):
        # authenticate
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
            return { 'signup': True } 
    
    return { 'error': 'An error occurred, failed to authenticate.' } 

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
