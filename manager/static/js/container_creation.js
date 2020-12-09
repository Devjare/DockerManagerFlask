let dictionaries = {
    'labels': {},
    'environment': {},
    'ports': {},
    'restart_policy': {
        'Name': '',
        'MaximumRetryCount': 0 
    },
    'lxcConf': {},
    'healthcheck': {},
    'extraHosts': {},
    'links': {},
    'logConfig': {},
    'storageOpt': {},
    'sysctls': {},
    'tmpfs': {}
}

function dataUpdated(dictName) {
    $(`#${dictName}`)[0].value = JSON.stringify(dictionaries[dictName]);
}

function updateDataValue(event, dictName) {
    // get value from key input of the changed value input event
    let target = $(event.target);
    let key = $(target.closest('tr')).find('.key-input')[0].value;
    let newValue = target[0].value;
    
    dictionaries[dictName][key] = newValue;
    dataUpdated();
}

function addNewDataRow() {
   $('#tableBody').append(`
    <tr class="new-row">
        <td><input class="form-control key-input" type="text" placeholder="Data Key"></td>
        <td><input class="form-control value-input" type="text" placeholder="Data Value"></td>
    </tr>`); 
}

function addNewData(dictName) {
    let newDataKeys = $('.new-row').find('.key-input');
    let newDataValues = $('.new-row').find('.value-input');

    // keys and values should have the same lengt, so it's the same use one or another.
    rowsCount = newDataKeys.length;
    for(let i = 0;i < rowsCount;i++) {
        key = newDataKeys[i].value;
        value = newDataValues[i].value;
        console.log(`data at: ${i}: ${key}=${value}`);

        // if the key is not empty, add to dictionary with it's value
        if(key != "") dictionaries[dictName][key] = value; 
    }

    dataUpdated(dictName);
}

function deleteDataRow(event, dictName) {
    let rowToDelete = event.target.parentNode.closest('tr');
    let propToDelete = rowToDelete.children[0].children[0].value;

    if(propToDelete in dictionaries[dictName]) {
        delete dictionaries[dictName][propToDelete];
        rowToDelete.remove();
    }
    else alert(`property ${propToDelete} is not on labels object.`);
    
    dataUpdated(dictName);
}

function showDictionaryModal(dictName) {
    let data = dictionaries[dictName];

    let counter = 0;
    let title = 'Mananage labels';
    
    let body = `<div class="d-flex flex-column">
    <table id="tableBody" class="table table-sm"> <thead class="thead-dark">
    <tr><th>Label Key</th><th>Label Value</th><th>Delete</th>
    </tr></thead><tbody id="tableBody">`
    for(key in data) {
        body += `
        <tr>
            <td><input class="form-control lkey-input" type="text" value="${key}" disabled></td>
            <td><input class="form-control lvalue-input" type="text" value="${data[key]}"></td>
            <td><a href="#" onclick="deleteDataRow(event, '${dictName}')">delete</a></td>
        </tr
        `;
    }
    body += `</tbody></table>
    <button class="btn btn-sm btn-primary align-self-end" onclick="addNewDataRow()">new</button>
    </div>`;
    
    let footer = `<div class="d-flex justify-content-end">
    <button class="btn btn-sm btn-secondary mx-1" data-dismiss="modal">Close</button>
    </div>`;

    showModal(title, body, footer, 
        (e) => {
            // onHide modal
            e.preventDefault();
            e.stopImmediatePropagation();

            // send modal to back to show the confirmation above all;
            let inputsToValidate = $('.new-row');
            if(inputsToValidate.length > 0) {
                if(validateInputs($('#modal input')) == false) {
                    showConfirmationModal(
                    `Are you sure to leave with blank fields?, if a key field is blank, it wont be added.
                    if a value is blank, the key will be added with no value.`, 
                        (e) => { 
                            addNewData(dictName);
                            hideConfirmationModal();
                            hideModal();
                        }, 
                        (e) => hideConfirmationModal());
                } else {
                    addNewData(dictName);
                    hideModal();
                }
            } else hideModal();

            return false;
        });
}

function showAddLabelModal() {
    let counter = 0;
    let title = 'Mananage labels';
    
    let body = `<div class="d-flex flex-column">
    <table id="tableBody" class="table table-sm"> <thead class="thead-dark">
    <tr><th>Label Key</th><th>Label Value</th><th>Delete</th>
    </tr></thead><tbody id="tableBody">`
    for(key in labels) {
        body += `
        <tr>
            <td><input class="form-control lkey-input" type="text" value="${key}" disabled></td>
            <td><input class="form-control lvalue-input" type="text" value="${labels[key]}" onchange="updateLabelValue(event)"></td>
            <td><a href="#" onclick="deleteLabel(event)">delete</a></td>
        </tr
        `;
    }
    body += `</tbody></table>
    <button class="btn btn-sm btn-primary align-self-end" onclick="addNewLabelRow()">new</button>
    </div>`;
    
    let footer = `<div class="d-flex justify-content-end">
    <button class="btn btn-sm btn-secondary mx-1" data-dismiss="modal">Close</button>
    </div>`;

    showModal(title, body, footer, 
        (e) => {
            // onHide modal
            e.preventDefault();
            e.stopImmediatePropagation();

            // send modal to back to show the confirmation above all;
            let inputsToValidate = $('.new-label');
            if(inputsToValidate.length > 0) {
                if(validateInputs($('#modal input')) == false) {
                    showConfirmationModal(
                    `Are you sure to leave with blank fields?, if a key field is blank, it wont be added.
                    if a value is blank, the key will be added with no value.`, 
                        (e) => { 
                            addNewLabels();
                            hideConfirmationModal();
                            hideModal();
                        }, 
                        (e) => hideConfirmationModal());
                } else {
                    addNewLabels();
                    hideModal();
                }
            } else hideModal();

            return false;
        });
}

function validateInputs(inputs) {
    for(key in inputs) 
        if(inputs[key].value == '') 
            return false;
    console.log('valid inputs!!!!');
    return true;
}

$('#chkRun').change(() => {
    if($('#chkRun')[0].checked) $('#chkRemove').removeAttr('disabled');
    else $('#chkRemove').attr('disabled', true);
});

function createContainer() {
 
    let runAfterCreate = $('#chkRun')[0].checked;
    image = $('#selectImage')[0].value; 

    // basics
    let name = $('#containerName')[0].value;
    let command = $('#command')[0].value;
    let ports = dictionaries['ports'];
    let hostname = $('#hostname')[0].value;
    let api_version = $('#apiversion')[0].value;
    let entrypoint = $('#entrypoint')[0].value;
    let working_dir = $('#working_dir')[0].value;
    let restart_policy = { 
        'Name': $('#restartPolicy')[0].value,
        'MaximumRetryCount': $('#maxRetryCount')[0].value
    };

    // environment and labels are both dicts
    let environment = dictionaries['environment'];
    let labels = dictionaries['labels'];

    let tty = $('#chkTty')[0].checked;
    let autoremove = $('#chkAutoremove')[0].checked;
    let detach = $('#chkDetach')[0].checked;
    
    // remove only works if Create and Run is selected.
    let remove = runAfterCreate ? $('#chkRemove')[0].checked : undefined;
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

    // TODO: validate before parsing to integer 
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
    let volumes_from = $('#volumeFrom')[0].value;
    
    // is a list, comma separated
    let mounts = $('#mounts')[0].value;
    
    // advanced
    let deviceReadBps = $('#deviceReadBps')[0].value;
    let deviceReadIops = $('#deviceReadIops')[0].value;
    let deviceWriteBps = $('#deviceWriteBps')[0].value;
    let deviceWriteIops = $('#deviceWriteIops')[0].value;
    let capAdd = $('#capAdd')[0].value;
    let capDrop = $('#capDrop')[0].value;
    let domainName = $('#domainName')[0].value;
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
    let utsMode = $('#utsMode')[0].value;
    let deviceCgroupRule = $('#deviceCgroupRule')[0].value;
    let devices = $('#devices')[0].value;
    let devicesRequests = $('#devicesRequests')[0].value;
    let dns = $('#dns')[0].value;
    let dnsOpt = $('#dnsOpt')[0].value;
    let dnsSearch = $('#dnsSearch')[0].value;
    let groupAdd = $('#groupAdd')[0].value;
    let securityOpt = $('#securityOpt')[0].value;
    let ulimits = $('#ulimits')[0].value;

    let oomKill = $('#chkOomKill')[0].checked;
    let init = $('#chkInit')[0].checked;
    let stderr = $('#chkStderr')[0].checked;
    let stream = $('#chkStream')[0].checked;
    let useConfigProxy = $('#chkUseConfigProxy')[0].checked;

    let oomScoreAdj = $('#oomScoreAdj')[0].value;
    let pidsLimit = $('#pidsLimit')[0].value;

    // validation section

    // assign all parameters to 'params'
    // which is the object to be sent to the server
    // to process and create the container.
    //
    params = {
        'runAfterCreate': runAfterCreate,
        'image': image,
        'name': name,
        'command': command,
        'ports': ports,
        'hostname': hostname,
        'api_version': api_version,
        'entrypoint': entrypoint,
        'working_dir': working_dir,
        'restart_policy': restart_policy,
        'environment': environment,
        'labels': labels,
        'tty': tty,
        'autoremove': autoremove,
        'detach': detach,
        'remove': remove,
        'publishAll': publishAll,
        'readOnly': readOnly,
        'privileged': privileged,
        'cgroup_parent': cgroup_parent,
        'cpu_count': cpu_count,
        'cpu_percent': cpu_percent,
        'cpu_period': cpu_period,
        'cpu_quota': cpu_quota,
        'cpu_rt_period': cpu_rt_period,
        'cpu_rt_runtime': cpu_rt_runtime,
        'cpu_shares': cpu_shares,
        'nano_cpus': nano_cpus,
        'cpuset_mems': cpuset_mems,
        'cpuset_cpus': cpuset_cpus,
        'mem_limit': mem_limit,
        'mem_reservation': mem_reservation,
        'mem_swappiness': mem_swappiness,
        'mem_swap_limit': mem_swap_limit,
        'blkio_weight': blkio_weight,
        'blkio_weight_device': blkio_weight_device,
        'network_disabled': network_disabled,
        'network': network,
        'network_mode': network_mode,
        'volume_driver': volume_driver,
        'volumes': volumes,
        'volumes_from': volumes_from,
        'mounts': mounts,
        'deviceReadBps': deviceReadBps,
        'deviceReadIops': deviceReadIops,
        'deviceWriteBps': deviceWriteBps,
        'deviceWriteIops': deviceWriteIops,
        'capAdd': capAdd,
        'capDrop': capDrop,
        'domainName': domainName,
        'initPath': initPath,
        'ipcMode': ipcMode,
        'isolation': isolation,
        'kernelMemory': kernelMemory,
        'macAddress': macAddress,
        'pidMode': pidMode,
        'platform': platform,
        'runtime': runtime,
        'shmSize': shmSize,
        'stopSignal': stopSignal,
        'usernsMode': usernsMode,
        'utsMode': utsMode,
        'deviceCgroupRule': deviceCgroupRule,
        'devices': devices,
        'devicesRequests': devicesRequests,
        'dns': dns,
        'dnsOpt': dnsOpt,
        'dnsSearch': dnsSearch,
        'groupAdd': groupAdd,
        'securityOpt': securityOpt,
        'ulimits': ulimits,
        'oomKill': oomKill,
        'init': init,
        'stderr': stderr,
        'stream': stream,
        'useConfigProxy': useConfigProxy,
        'oomScoreAdj': oomScoreAdj,
        'pidsLimit': pidsLimit
    };


    let reqObj = {
        'type': 'GET',
        'url': `http://localhost:8000/containers/${action}/${id}`,
        'isAsync': true,
        'params': null
    };
    sendRequest(reqObj,
        (response) => refresh(),
        (error) => dump(`Error procesing petition, error: ${error}`));
}
