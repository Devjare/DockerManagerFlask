// Default invalid input messages for fields in container_creation page.
var containersFieldsMessages = {
    'containerName': 'Invalid name: only letters, numbers, underscore and hyphen',
    'hostname': 'Invalid name: only letters, numbers, underscore and hyphen',
    'apiversion': 'Invalid String: Only numbers and .',
    'working_dir': 'File format path only, e.g /folder_name/folder',
    'maxRetryCount': 'Invalid Entry: Only numbers',
    'cgroupParent': 'Only letters, numbers, _ and - are allowed.',
    'cpusetMems': 'Invalid input, only numbers, - and ,.',
    'cpusetCpus': 'Invalid input, only numbers, - and ,.',
    'memLimit': 'Invalid input, only numbers and the unit letter(b,B,k,K,m,M,g,G)',
    'memReservation': 'Invalid input, only numbers and the unit letter(b,B,k,K,m,M,g,G)',
    'memSwapLimit': 'Invalid input, only numbers and the unit letter(b,B,k,K,m,M,g,G)',
    'volumeDriver': 'Only numbers, letters, _, and - are allowed.',
    'initPath': 'File format path only, e.g /folder_name/folder',
    'ipcMode': 'Only numbers, letters, _, and : are allowed',
    'isolation': 'Only numbers, letters and _ are allowed.',
    'kernelMemory': 'Invalid input, only numbers and the unit letter(b,B,k,K,m,M,g,G)',
    'macAddress': 'Invalid input, enter a valid mac address.',
    'pidMode': 'Only numbers, letters and _ are allowed.',
    'platform': 'Only numbers, letters and _ are allowed.',
    'runtime': 'Only numbers, letters and _ are allowed.',
    'shmSize': 'Invalid input, only numbers and the unit letter(b,B,k,K,m,M,g,G)',
    'stopSignal': 'Only letters, -, and _ are allowed.',
    'user': 'Only numbers, letters, _, and - are allowed.',
    'usernsMode': 'Only numbers, letters, _, and - are allowed.',
    'utsMode': 'Only numbers, letters, and  _ are allowed.',
    'cpuPeriod': 'Valid range between 1000 and 1000000.',
};

// When creating a container, many kind of arguments are needed,
// objects and lists are some of them.
// The above objects save the name of the arg needed and it's value
// those are gonna be passed to the server.
let dictionaries = {
    'labels': {},
    'environment': {},
    'ports': {},
    'lxc_conf': {},
    'healthcheck': {},
    'extra_hosts': {},
    'links': {},
    'log_config': {},
    'storage_opt': {},
    'sysctls': {},
    'tmpfs': {}
}

let lists = {
    'command': [],
    'entrypoint': [],
    'volumes': [],
    'volumes_from': [],
    'mounts': [],
    'cap_add': [],
    'cap_drop': [],
    'domainname': [],
    'device_cgroup_rules': [],
    'devices': [],
    'device_requests': [],
    'dns': [],
    'dns_opt': [],
    'dns_search': [],
    'group_add': [],
    'security_opt': [],
    'ulimits': []
}

function showDictModal(dictname) {
    let data = dictionaries[dictname];
    showDictionaryModal(data, dictname);
}

function showLModal(listname) {
    let data = lists[listname];
    showListModal(data, listname);
}

$('#chkRun').change(() => {
    if($('#chkRun')[0].checked) {
        $('#chkRemove').removeAttr('disabled');
        $('#chkStdout').removeAttr('disabled');
        $('#chkStderr').removeAttr('disabled');
    }
    else {
        $('#chkRemove').attr('disabled', true);
        $('#chkStdout').attr('disabled', true);
        $('#chkStderr').attr('disabled', true);
    }
});

function invalidParamsExists() {
    for(key in containersFieldsMessages) {
        if(!document.getElementById(key).checkValidity()) {
            document.getElementById(key).setCustomValidity(containersFieldsMessages[key]);
            document.getElementById(key).reportValidity();
            return true;
        }
    }
    return false;
}

function createContainer() {

    // if there are at least one invalid field(marked in red)
    // a message will show up and cannot procceed to creation.
    if(invalidParamsExists()) {
        showAlert('invalid params, check red marked fields!', 'danger');
        return;
    }
    let runAfterCreate = $('#chkRun')[0].checked;
    image = $('#selectImage')[0].value; 

    // basics
    let name = $('#containerName')[0].value;
    validateStrFor(name, 'noinvalidchars');
    let command = $('#command')[0].value;
    let ports = dictionaries['ports'];
    let hostname = $('#hostname')[0].value;
    let api_version = $('#apiversion')[0].value;
    let entrypoint = $('#entrypoint')[0].value;
    let working_dir = $('#working_dir')[0].value;
    let restart_policy = { 
        'Name': $('#restartPolicy')[0].value,
        'MaximumRetryCount': valueOrNull($('#maxRetryCount')[0].value, 'number')
    };

    // environment and labels are both dicts
    let environment = dictionaries['environment'];
    let labels = dictionaries['labels'];

    let tty = $('#chkTty')[0].checked;
    let autoremove = $('#chkAutoremove')[0].checked;
    let detach = $('#chkDetach')[0].checked;

    // remove only works if Create and Run is selected.
    let publishAll = $('#chkPublishAll')[0].checked;
    let readOnly = $('#chkReadOnly')[0].checked;
    let privileged = $('#chkPrivileged')[0].checked;

    // resources 
    let cgroup_parent = $('#cgroupParent')[0].value;
    let cpu_count = $('#cpuCount')[0].value;
    let cpu_percent = $('#cpuPercent')[0].value;
    let cpu_period = $('#cpuPeriod')[0].value;
    let cpu_quota = $('#cpuQuota')[0].value;
    let cpu_rt_period = $('#cpuRtPeriod')[0].value;
    let cpu_rt_runtime = $('#cpuRtRuntime')[0].value;
    let cpu_shares = $('#cpuShares')[0].value;
    let nano_cpus = $('#nanoCpus')[0].value;

    cgroup_parent = Number(cgroup_parent);
    cpu_count = Number(cpu_count);
    cpu_percent = Number(cpu_percent);
    cpu_period = Number(cpu_period);
    cpu_quota = Number(cpu_quota);
    cpu_rt_period = Number(cpu_rt_period);
    cpu_rt_runtime = Number(cpu_rt_runtime);
    cpu_shares = Number(cpu_shares);
    nano_cpus = Number(nano_cpus); 

    let cpuset_mems = $('#cpusetMems')[0].value;
    let cpuset_cpus = $('#cpusetCpus')[0].value;
    let mem_limit = $('#memLimit')[0].value;
    let mem_reservation = $('#memReservation')[0].value;

    let mem_swappiness = $('#memSwappiness')[0].value;
    let mem_swap_limit = $('#memSwapLimit')[0].value;
    let blkio_weight = $('#blkioWeight')[0].value;
    let blkio_weight_device = $('#blkioWeightDevice')[0].value;

    // networks
    let network_disabled = $('#chkNetworkDisabled')[0].checked;
    let network = $('#network')[0].value;
    let network_mode = $('#networkMode')[0].value;

    // volumes
    let volume_driver = $('#volumeDriver')[0].value;
    // volumes should be a dictionary 
    let volumes = $('#volumes')[0].value;
    // volumes_from is a list comma separated
    let volumes_from = $('#volumes_from')[0].value;

    // is a list, comma separated
    let mounts = $('#mounts')[0].value;

    // advanced
    let deviceReadBps = $('#deviceReadBps')[0].value;
    let deviceReadIops = $('#deviceReadIops')[0].value;
    let deviceWriteBps = $('#deviceWriteBps')[0].value;
    let deviceWriteIops = $('#deviceWriteIops')[0].value;
    let capAdd = $('#cap_add')[0].value;
    let capDrop = $('#cap_drop')[0].value;
    let domainName = $('#domainname')[0].value;
    let initPath = $('#initPath')[0].value;
    let ipcMode = $('#ipcMode')[0].value;
    let isolation = $('#isolation')[0].value;
    let kernelMemory = $('#kernelMemory')[0].value;
    let macAddress = $('#macAddress')[0].value;
    let pidMode = $('#pidMode')[0].value;
    let platform = $('#platform')[0].value;
    let runtime = $('#runtime')[0].value;
    let shmSize = $('#shmSize')[0].value;
    let stopSignal = $('#stopSignal')[0].value;
    let usernsMode = $('#usernsMode')[0].value;
    let user = $('#user')[0].value;
    let utsMode = $('#utsMode')[0].value;
    let deviceCgroupRule = $('#device_cgroup_rules')[0].value;
    let devices = $('#devices')[0].value;
    let deviceRequests = $('#device_requests')[0].value;
    let dns = $('#dns')[0].value;
    let dnsOpt = $('#dns_opt')[0].value;
    let dnsSearch = $('#dns_search')[0].value;
    let groupAdd = $('#group_add')[0].value;
    let securityOpt = $('#security_opt')[0].value;
    let ulimits = $('#ulimits')[0].value;

    let oomKill = $('#chkOomKill')[0].checked;
    let init = $('#chkInit')[0].checked;
    let stdin_open = $('#chkStdinOpen')[0].checked;
    let stream = $('#chkStream')[0].checked;
    let useConfigProxy = $('#chkUseConfigProxy')[0].checked;

    let extra_hosts = dictionaries['extra_hosts'];
    let healthcheck = dictionaries['healthcheck'];
    let lxc_conf = dictionaries['lxc_conf'];
    let links = dictionaries['links'];
    let log_config = dictionaries['log_config'];
    let storage_opt = dictionaries['storage_opt'];
    let sysctls = dictionaries['sysctls'];
    let tmpsf = dictionaries['tmpfs'];

    let oomScoreAdj = $('#oomScoreAdj')[0].value;
    let pidsLimit = $('#pidsLimit')[0].value;

    params = { 
        'advancedCreation': true,
        'run': runAfterCreate,
        'image': image 
    };

    if(name) params['name'] = name;
    if(lists['command'].length > 0) params['command'] = lists['command'];
    if(!isObjectEmpty(dictionaries['ports'])) params['ports'] = dictionaries['ports'];     
    if(hostname) params['hostname'] = hostname;
    if(api_version) params['version'] = api_version;
    if(lists['entrypoint'].length > 0) params['entrypoint'] = lists['entrypoint'];
    if(working_dir) params['working_dir'] = working_dir;
    if(restart_policy) params['restart_policy'] = restart_policy;
    if(!isObjectEmpty(dictionaries['environment'])) params['environment'] = dictionaries['environment'];    
    if(!isObjectEmpty(dictionaries['labels'])) params['labels'] = dictionaries['labels'];    
    params['tty'] = tty;
    params['auto_remove'] = autoremove;
    params['detach'] = detach;
    params['publish_all_ports'] = publishAll;
    params['read_only'] = readOnly;
    params['privileged'] = privileged;

    if(cgroup_parent) params['cgroup_parent'] = cgroup_parent;
    if(cpu_count) params['cpu_count'] = cpu_count;
    if(cpu_percent) params['cpu_percent'] = cpu_percent;
    if(cpu_period) params['cpu_period'] = cpu_period;
    if(cpu_quota) params['cpu_quota'] = cpu_quota;
    if(cpu_rt_period) params['cpu_rt_period'] = cpu_rt_period;
    if(cpu_rt_runtime) params['cpu_rt_runtime'] = cpu_rt_runtime;
    if(cpu_shares) params['cpu_shares'] = cpu_shares;
    if(nano_cpus) params['nano_cpus'] = nano_cpus;
    if(cpuset_mems) params['cpuset_mems'] = cpuset_mems;
    if(cpuset_cpus) params['cpuset_cpus'] = cpuset_cpus;
    if(mem_limit) params['mem_limit'] = mem_limit;
    if(mem_reservation) params['mem_reservation'] = mem_reservation;
    if(mem_swappiness) params['mem_swappiness'] = mem_swappiness;
    if(mem_swap_limit) params['memswap_limit'] = mem_swap_limit;
    if(blkio_weight) params['blkio_weight'] = blkio_weight;
    if(blkio_weight_device) params['blkio_weight_device'] = blkio_weight_device;

    params['network_disabled'] = network_disabled;
    if(network_disabled && network) params['network'] = network;
    if(network_mode) params['network_mode'] = network_mode;

    if(volume_driver) params['volume_driver'] = volume_driver;
    if(lists['volumes'].length > 0) params['volumes'] = lists['volumes'];
    if(lists['volumes_from'].length > 0) params['volumes_from'] = lists['volumes_from'];
    if(lists['mounts'].length > 0) params['mounts'] = lists['mounts'];

    if(deviceReadBps) params['device_read_bps'] = deviceReadBps;
    if(deviceReadIops) params['device_read_iops'] = deviceReadIops;
    if(deviceWriteBps) params['device_write_bps'] = deviceWriteBps;
    if(deviceWriteIops) params['device_write_iops'] = deviceWriteIops;
    if(lists['cap_add'].length > 0) params['cap_add'] = lists['cap_add'];
    if(lists['cap_drop'].length > 0) params['cap_drop'] = lists['cap_drop'];
    if(lists['domainname'].length > 0) params['domainname'] = lists['domainname'];
    if(initPath) params['init_path'] = initPath;
    if(ipcMode) params['ipc_mode'] = ipcMode;
    if(isolation) params['isolation'] = isolation;
    if(kernelMemory) params['kernel_memory'] = kernelMemory;
    if(macAddress) params['mac_address'] = macAddress;
    if(pidMode) params['pid_mode'] = pidMode;
    if(platform) params['platform'] = platform;
    if(runtime) params['runtime'] = runtime;
    if(shmSize) params['shm_size'] = shmSize;
    if(stopSignal) params['stop_signal'] = stopSignal;
    if(usernsMode) params['userns_mode'] = usernsMode;
    if(user) params['user'] = user;
    if(utsMode) params['uts_mode'] = utsMode;
    if(lists['device_cgroup_rules'].length > 0) params['device_cgroup_rules'] = lists['device_cgroup_rules'];
    if(lists['devices'].length > 0) params['devices'] = lists['devices'];
    if(lists['device_requests'].length > 0) params['device_requests'] = lists['device_requests'];
    if(lists['dns'].length > 0) params['dns'] = lists['dns'];
    if(lists['dns_opt'].length > 0) params['dns_opt'] = lists['dns_opt'];
    if(lists['dns_search'].length > 0) params['dns_search'] = lists['dns_search'];
    if(lists['group_add'].length > 0) params['group_add'] = lists['group_add'];
    if(lists['security_opt'].length > 0) params['security_opt'] = lists['security_opt'];
    if(lists['ulimits'].length > 0) params['ulimits'] = lists['ulimits'];
    if(!isObjectEmpty(dictionaries['extra_hosts'])) params['extra_hosts'] = dictionaries['extra_hosts'];    
    if(!isObjectEmpty(dictionaries['healthcheck'])) params['healthcheck'] = dictionaries['healthcheck'];    
    if(!isObjectEmpty(dictionaries['lxc_conf'])) params['lxc_conf'] = dictionaries['lxc_conf'];    
    if(!isObjectEmpty(dictionaries['links'])) params['links'] = dictionaries['links'];     
    if(!isObjectEmpty(dictionaries['log_config'])) params['log_config'] = dictionaries['log_config'];    
    if(!isObjectEmpty(dictionaries['storage_opt'])) params['storage_opt'] = dictionaries['storage_opt'];    
    if(!isObjectEmpty(dictionaries['sysctls'])) params['sysctls'] = dictionaries['sysctls'];    
    if(!isObjectEmpty(dictionaries['tmpfs'])) params['tmpfs'] = dictionaries['tmpfs'];     
    params['oom_kill_disable'] = oomKill;
    params['init'] = init;
    params['stdin_open'] = stdin_open;
    params['stream'] = stream;
    params['use_config_proxy'] = useConfigProxy;
    if(oomScoreAdj) params['oom_score_adj'] = oomScoreAdj;
    if(pidsLimit) params['pids_limit'] = pidsLimit;

    let reqObj = {
        'type': 'POST',
        'url': '/containers/create',
        'isAsync': true,
        'params': JSON.stringify(params),
        'requestHeaders': { 'Content-Type': 'application/json' }
    };

    sendRequest(reqObj, 
        (e) => console.log('loading request...'),
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) {
                showAlert(`An error ocurred creating the container: ${res.error}`, 'danger');
                console.log('error: ', res.error);
            }
            else {
                showAlert('Container created succesfully!', 'success');
                location.href = '/containers';
            }
        }, 
        (error) => {
            showAlert(`Container failed to create, error: ${error}.`, 'danger');
            console.log('error for container creation: ', error);
        });
}
