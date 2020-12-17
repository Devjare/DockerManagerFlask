// TODO: Search while in a filtered section, not working, solve.

// global vars
var currentFilter = 'all';
var currentView = 'list';

function showPopover(id) {
    $(`#${id}`).popover('show');
}
function hidePopover(id) {
    $(`#${id}`).popover('hide');
}

$(document).on({
    'mouseenter': function (e) {
        let id = e.currentTarget.id;
        showPopover(id);
    },
    'mouseleave': function (e) {
        let id = e.currentTarget.id;
        hidePopover(id);
    }
});

function triggerContainerAction(id, action) {
    let reqObj = {
        'type': 'GET',
        'url': `http://localhost:8000/containers/${action}/${id}`,
        'isAsync': true,
        'params': null
    };
    sendRequest(reqObj, null,
        (response) => {
            console.log('container action response: ', response);
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert('An error occurred triggering container action.', 'danger');
            else {
                refresh();
            }
        },
        (error) => {
            console.log('error: ', error);
            showAlert('An error occurred trying to make a request, check console for more info.', 'danger');
        });
}

function goToDetailsOf(containerName) {
    console.log('container to detail name: ', containerName);
    localStorage.setItem('container', containerName.substr(1, containerName.length));
    // pass the current container list, only names
    containersNames = containers.map(c => { 
        let name = c.Names[0];
        return name.substr(1, name.length);
    });
    console.log('containers names: ', containersNames);
    localStorage.setItem('containers_list', containersNames);
    location.href = '/container_details';
}
function showCModal(container) {
    let state = container.State;
    let id = container.Id;
    
    let title = 'Container action';

    let body = `<div class="container-fluid">
    <div class="row"><strong>ID: ${id}</strong><p id="container-id">&nbsp;</p></div>
    <div class="row"><strong>Name: ${container.Names}</strong><p id="container-name">&nbsp;</p></div>
    <div class="row"><strong>IP/Ports: ${portsArrayToString(container.Ports)}</strong><p id="container-ipport">&nbsp;</p></div>
    <div class="row"><strong>State: ${state}</strong><p id="container-state">&nbsp;</p></div>
    <div class="row"><strong>Status: ${container.Status}</strong><p id="container-status">&nbsp;</p></div>
    <div class="row"><strong>Image: ${container.Image}</strong><a href="#" id="container-image"></a></div>
    &nbsp;<div class="row"><strong>Created: ${timeConverter(container.Created)}</strong><p id="container-created">&nbsp;</p></div>
    </div>`;

    let footer = `
        <div class="w-100 d-flex justify-content-between">
        <a class="d-flex align-self-center" href="#" onclick="goToDetailsOf('${container.Names[0]}')">Container details</a>`;
    if(state == 'exited' || state == 'created') {
        footer += `
        <div class="d-flex">
        <button type="button" class="btn btn-secondary mx-1" data-dismiss="modal">Close</button>
        <button onclick="triggerContainerAction('${id}','start')" type="button" class="btn btn-primary mx-1" data-dismiss="modal">Start</button>
        </div>`
    } else if(state == 'paused') {
        footer += `
        <div class="d-flex">
        <button type="button" class="btn btn-secondary mx-1" data-dismiss="modal">Close</button>
        <button onclick="triggerContainerAction('${id}','unpause')" type="button" class="btn btn-info mx-1" data-dismiss="modal">Unpause</button>
        <button onclick="triggerContainerAction('${id}','stop')" type="button" class="btn btn-danger mx-1" data-dismiss="modal">Stop</button>
        </div>`
    } else if(state == 'running') {
        footer += `
        <div class="d-flex">
        <button type="button" class="btn btn-secondary mx-1" data-dismiss="modal">Close</button>
        <button onclick="triggerContainerAction('${id}','restart')" type="button" class="btn btn-warning mx-1" data-dismiss="modal">Restart</button>
        <button onclick="triggerContainerAction('${id}','pause')" type="button" class="btn btn-info mx-1" data-dismiss="modal">Pause</button>
        <button onclick="triggerContainerAction('${id}','stop')" type="button" class="btn btn-danger mx-1" data-dismiss="modal">Stop</button>
        </div>`
    }
    
    footer += '</div>';
    showModal(title, body, footer);
}

// containers actions

function showContainerDetails(id) {
    // showmodal
    let container = containers.find(c => c.Id == id);
    showCModal(container);
    $('#modal').ready(() => {
        $('#modalFooter > #btnLaunchContainer').click((e) => {
            triggerContainerAction(id, 'start');
        });
    });
}

var containersIds;
var containers;

function buildContainerTableRow(container, index) {
    let color = "";
    let state = container.State;
    let ipport = "";
        
    if(container.Ports.length > 0) {
        let p = container.Ports[0];
        ipport = `${p.IP}:${p.PublicPort}->${p.PrivatePort}/${p.Type}`;
    }

    if(state == 'running') color = 'success';
    else if(state == 'paused') color = 'info';
    else if(state == 'stopped') color = 'danger';
    else if(state == 'restarting') color = 'warning';
    let template = `<tr class="table-${color}">
      <th scope="row">${index}</th>
      <td scope="row"><span class="icon" onclick="showDeleteContainerModal('${container.Names[0]}')" data-feather="trash"></span></td>
      <td>${container.Id}</td>
      <td>${container.Names[0]}</td>
      <td>${container.State}</td>
      <td>${ipport == ""?"NONE":ipport}</td>
      <td><a href="#" id="${container.Id}" class="popover-item" data-placement="bottom" 
      data-toggle="popover" title="Image Info" data-content="ID: ${container.ImageID}">${container.Image}</a></td>
      <td><a href="#" onclick="showContainerDetails('${container.Id}')">More</a></td>
    </tr>`
    return template;
}

function buildContainerHtmlTemplate(container) {

    let state = container.State;
    let cardHeaderClasses = "";
    if(state == "running") cardHeaderClasses = "bg-success text-white"
    else if(state == "paused") cardHeaderClasses = "bg-info text-white"
    else if(state == "dead") cardHeaderClasses = "bg-danger text-white"
    else if(state == "restarting") cardHeaderClasses = "bg-warning"

    var containerHtmlTemplate = `
    <div id="${container.Id}" class="card">
    <div class="card-header ${cardHeaderClasses} grid-card-header">${container.Names} (${state})
        <span onclick="showDeleteContainerModal('${container.Names[0]}')" data-feather="trash"></span>
    </div>
    <div class="card-body">
        <p class="card-text"><strong>ID: </strong>${container.Id}</p>
        <p class="card-text"><strong>Base Image: </strong>${container.Image}</p>
        <a onclick="showContainerDetails('${container.Id}')" href="#">More...</a>
    </div></div>`
    return containerHtmlTemplate;
}

function loadContainers(containers, filter) {
    console.log('containers loaded: ', containers);
    clearContainersPanel();
    let filtered;
    
    if(filter != 'all') filtered = filterContainersBy(filter);
    else filtered = containers;

    let index = 1;
    filtered.forEach(c => {
        rowsTemplate = buildContainerTableRow(c, index);
        document.querySelector('.table-body').innerHTML += rowsTemplate;

        gridTemplate = buildContainerHtmlTemplate(c);
        document.querySelector('#containersGrid > div').innerHTML += gridTemplate;
    
        if(currentView == 'list') {
            document.getElementById('containersGrid').style.display="none";
            document.getElementById('containersList').style.display="flex";
        } else {
            document.getElementById('containersGrid').style.display="flex";
            document.getElementById('containersList').style.display="none";
        }
        index++;
        feather.replace();
    });
}

function refresh() {
    let reqObj = {
        'type': 'GET',
        'url': `/containers/json`,
        'isAsync': true,
        'params': null
    };
    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert('An error ocurred obtaining containers, check server logs.', 'danger');
            else {
                showAlert('Containers obtained successfully!, refreshing list!', 'success');
                console.log('containers/json response: ', res);
                containers = res['containers'];
                loadContainers(containers, currentFilter);
            }
        },
        (error) => {
            console.log('error: ', error);
            showAlert('An error occurred trying to make a request, check console for more info.', 'danger');
        });
}

function formatView(format) {
    if(format == 'list') {
        // list
        document.getElementById('containersList').style.display = 'flex';
        document.getElementById('containersGrid').style.display = 'none';
    } else {
        // grid
        document.getElementById('containersList').style.display = 'none';
        document.getElementById('containersGrid').style.display = 'flex';
    }
    currentView = format;
}

function filterContainersBy(state) {
    filtered = [];
    if(state == 'all') filtered = containers;
    else if(state == 'created/exited') 
        filtered = containers.filter(c => c.State == 'created' || c.State == 'exited');
    else 
        filtered = containers.filter(c => c.State == state);

    return filtered;
}

function filterBy(state) {
    clearContainersPanel();
    currentFilter = state;
    $('#btnFilterBy').text(state);
    filteredContainers = filterContainersBy(state);
    loadContainers(filteredContainers, currentFilter);
}

function findContainersBy(pattern) {
    return containers.filter(c => 
        c.Id.includes(pattern)  
        || c.Names[0].includes(pattern) 
        || c.Image.includes(pattern) 
        || c.ImageID.includes(pattern));
}

function searchContainers() {
    let text = $('#searchText')[0].value;
    loadContainers(findContainersBy(text), currentFilter);
}

function clearContainersPanel() {
    // Delete all cards from container panel.
    document.querySelector('#containersGrid > .card-columns').innerHTML = '';
    document.querySelector('.table-body').innerHTML = '';
}



function deleteContainer(container) {
    console.log('deleting container: ', container);
    let volumes = $('#chkVolumes')[0].checked;
    let links = $('#chkLink')[0].checked;
    let force = $('#chkForce')[0].checked;

    let reqObj = {
        'type': 'GET',
        'url': `/containers/delete?container=${container}&volumes=${volumes}&links=${links}&force=${force}`,
        'isAsync': true,
        'params': null
    };

    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert('An error ocurred deleting the container, check server logs.', 'danger');
            else {
                showAlert('Container deleted successfully!', 'success');
                refresh();
            }
        },
        (error) => {
            console.log('error: ', error);
            showAlert('An error occurred trying to make a request, check console for more info.', 'danger');
        });
}

function showDeleteContainerModal(container) {
    let title = 'Delete container';
    
    let body = `<h5>Deleting: ${container}</h5>
    <div class="form-check">
        <input type="checkbox" class="form-check-input" id="chkVolumes">
        <label class="form-check-label mt-2 ml-2" for="chkVolumes">Delete Associated Volumes</label>
    </div>
    <div class="form-check">
        <input type="checkbox" class="form-check-input" id="chkLink">
        <label class="form-check-label mt-2 ml-2" for="chkLink">Delete Links</label>
    </div>
    <div class="form-check">
        <input type="checkbox" class="form-check-input" id="chkForce">
        <label class="form-check-label mt-2 ml-2" for="chkForce">Force removal(SIGKILL)?</label>
    </div>`;
    
    let footer = `
        <button onclick="deleteContainer('${container.replace('/','')}')" class="btn btn-primary" data-dismiss="modal">Delete</button>
         <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>`;   
    
    showModal(title, body, footer);
}

$('.site-content').ready((e) => {
    console.log('site ready!');
    refresh();
});
