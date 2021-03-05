from flask import Blueprint, render_template, session, request, current_app
from app import dockercli, client, db
from app.constants import USERID, USERCONTAINERS, USERNAME
from app.db_models import UsersContainers, Container
import requests
import simplejson as json
import docker

containers_bp = Blueprint("containers", __name__, static_folder="url_for('static')", template_folder="url_for('templates')")

@containers_bp.route('/creation')
def showContainerCreation():
    images = dockercli.images() 
    return render_template('containers/creator.html', images=images)

@containers_bp.route('/create', methods=['POST'])
def createContainer():
    print('------------- TRYING TO CREATE CONTAINER ----------------------')
    print('session before create container: ', session)
    data = request.json
    container = {}
  
    # if the parameters is not on the data from client object
    # then it's gonna be passed as None(null for docker)
    if('advancedCreation' in data):
        if(not data['run']):
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
                addContainerToUser(container.id)
            except docker.errors.APIError as api_error:
                return { 'error': str(api_error) }
            except docker.errors.ImageNotFound as error:
                return { 'error': str(error) }
        else:        
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

                addContainerToUser(container.id)
            except docker.errors.APIError as api_error:
                # since there's no way on knowing on client side, what caused the error
                # just return that there was an error, hoping for the sdk to implement something
                # for that.
                return { 'error': str(api_error) }
            except docker.errors.ImageNotFound as error:
                return { 'error': str(error) }
    else:
        # if not advanced
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

        try:
            container = client.containers.create(image=data['image'], name=data['name'], ports=ports, command=command, tty=data['tty'], volumes=volume)
        except docker.errors.APIError as err:
            return { 'error': str(err) }
        except docker.errors.ImageNotFount as img_err:
            return { 'error': str(img_err) }

        addContainerToUser(container.id)
   
    if(data['run']):
        try:
            container.start()
        except docker.errors.APIError as err:
            return { 'error': str(err) }
    # Add container info to database
    new_container = Container(container.id, container.name, container.image.id)
    db.session.add(new_container)
    db.session.commit()
    print('session after creating container: ', session)
    
    # add recently created container to user session containers array.
    
    current_containers = session[USERCONTAINERS]
    current_containers.append(container.id)
    session[USERCONTAINERS] = current_containers

    return { 'containerid': container.short_id }

@containers_bp.route('/delete', methods=["GET"])
def deleteContainer():
    container = request.args.get('container')
    volumes = request.args.get('volumes')
    links = request.args.get('links')
    force = request.args.get('force')
    try:
        container = client.containers.get(str(container))
        
        # delete from db, Container
        containerDb = Container.query.get(container.id)
        db.session.delete(containerDb)
        
        # delete row on UserContainerTable
        usercontainer = UsersContainers.query.filter_by(user_id=session[USERID], container_id=container.id).first()
        db.session.delete(usercontainer)
        db.session.commit()

        # remove on docker
        container.remove(v=volumes, link=links, force=force)
    except docker.errors.ImageNotFound as e: 
        return { 'error': str(e) }
    except docker.errors.APIError as e: 
        return { 'error': str(e) }

    # delete container id from session
    current_containers = session[USERCONTAINERS]
    current_containers.remove(container.id)
    session[USERCONTAINERS] = current_containers
    
    return { 'deleted': True }

@containers_bp.route('/commit', methods=['POST'])
def commitContainer():
    data = request.json
    container = client.containers.get(str(data['id']))
    confing = json.loads(data['conf']) if 'conf' in data else None
    try:
        # first 2 args are obligatory
        container.commit(
                repository = data['repository'], 
                tag = data['tag'],
                message = data['message'] if 'message' in data else None,
                author = data['author'] if 'author' in data else None,
                change = data['changes'] if 'changes' in data else None,
                conf = config)

    except docker.errors.APIError as e: 
        return { 'error': str(e) }
    return { 'success': True } 

@containers_bp.route('/details')
def showContainerDetails():
    return render_template('containers/details.html')

@containers_bp.route('/json')
def getContainers():
    containers = dockercli.containers(all=True)
    if session[USERCONTAINERS]:
        try:
            print('BEFORE filtering containers: ', containers)
            containers = filter(lambda c: c['Id'] in session[USERCONTAINERS], containers) 
            print('AFTER filtering containers: ', containers)
        except Exception as err:
            print('Exception while filtering containers: ', err)
    else:
        return { 'containers': [] }

    return {'containers': containers}

@containers_bp.route('/')
@containers_bp.route('/containers')
def listContainers():
    # list containers only of the given user.
    containerslist = getContainers()['containers']

    # allcontainers = client.containers.list(all=True);
    # formattedContainers = map(containerToJson, allcontainers)
    jsonArray = { "containers": containerslist }
    return render_template('containers/list.html', containers=json.dumps(jsonArray))

@containers_bp.route('/inspect/<id>', methods=["GET"])
def getContainerInfo(id):
    container = {}
    try:
        container = dockercli.inspect_container(id)
    except docker.errors.APIError as err:
        return { "error": str(err) }
    return {"container": container} 

@containers_bp.route('/start/<id>')
def startContainer(id):
    try:
        dockercli.start(id)
    except docker.errors.APIError as err:
        return { 'error': str(err) }
    return { 'started': True }

@containers_bp.route('/stop/<id>')
def stopContainer(id):
    try:
        dockercli.stop(id)
    except docker.errors.APIError as err:
        return { 'error': str(err) }
    return { 'stopped': True }

@containers_bp.route('/restart/<id>')
def restartContainer(id):
    try:
        dockercli.restart(id)
    except docker.errors.APIError as err:
        return { 'error': str(err) }
    return { 'restarting': True }

@containers_bp.route('/pause/<id>')
def pauseContainer(id):
    try:
        dockercli.pause(id)
    except docker.errors.APIError as err:
        return { 'error': str(err) }
    return { 'paused': True }

@containers_bp.route('/unpause/<id>')
def unpauseContainer(id):
    try:
        dockercli.unpause(id)
    except docker.errors.APIError as err:
        return { 'error': str(err) }
    return { 'unpaused': True }

# Helper function

# Function to map Containers objet to json, in order to use themo on JS
def containerToJson(container):
    image = {"id": container.image.id, "tags": container.image.tags}
    c = {"id": container.short_id, "name": container.name, "status": container.status, "image": image}
    return json.dumps(c)

def addContainerToUser(idcontainer):
    print('session adding container: ', session)
    userContainer = UsersContainers(session[USERID], idcontainer)
    db.session.add(userContainer)
    db.session.commit()
