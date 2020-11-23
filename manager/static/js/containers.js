// TODO: ADD builder.html
// TODO: USE GENERATORS FOR docker stats() STREAM FROM FLASK
// TODO: TRY TO IMPLEMENT LIVE RELOAD TO CONTAINERS, LEAVING OUT THE REFRESH BUTTON.
// TODO: DESING CONTAINER/IMAGE DETAILS SCREEN(THIS IS GONNA USE GRAPHICS).
// TODO: Search while in a filtered section, not working, solve.
// TODO: Maybe make an admin account, who can see every container.
// TODO: ADD DELETE OPTION FOR CONTAINERS/IMAGES
// TODO: ADD LOADING OPTION, WHEN STARTING/STOPPING/PAUSING/UNPAUSING A CONTAINER
// ON THE MODAL, IT WON'T CLOSE UNTIL THE ACTION IS DONE. OR MAYBE
// SHOW AN ICON ON THE ROW/CARD OF THE CONTAINER SHOWING THAT THE ACTION IS STILL
// ON PROGRESS

// global vars
var xhr = new XMLHttpRequest();
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
}, ".popover-item");

function triggerContainerAction(id, action) {
    xhr.open('GET', `http://localhost:8000/containers/${action}/${id}`, true);
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                dump(xhr.responseText)
                refresh();
            }
            else
                dump("Error procesing petition");
        }
    };
    xhr.send(null);
}


function showModal(container) {
    let state = container.State;
    let id = container.Id;
    let modalFooter = '';

    $('#modal').modal('show');
    $('#container-id').text(id);
    $('#container-name').text(container.Names);
    $('#container-ipport').text(portsArrayToString(container.Ports));
    $('#container-status').text(container.Status);
    $('#container-state').text(state);
    $('#container-created').text(timeConverter(container.Created));
    $('#container-image').text(container.Image);

    if(state == 'exited' || state == 'created') {
        modalFooter += `<div class="form-check">
     <input class="form-check-input" type="checkbox" value="" id="chkLaunchOptions">
     <label class="form-check-label" for="chkLaunchOptions">
         Add arguments to launch?
     </label>
     </div>
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    <button onclick="triggerContainerAction('${id}','start')" type="button" class="btn btn-primary" data-dismiss="modal">Start</button>`
    } else if(state == 'paused') {
        modalFooter += `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button onclick="triggerContainerAction('${id}','unpause')" type="button" class="btn btn-info" data-dismiss="modal">Unpause</button>
        <button onclick="triggerContainerAction('${id}','stop')" type="button" class="btn btn-danger" data-dismiss="modal">Stop</button>`
    } else if(state == 'running') {
        modalFooter += `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button onclick="triggerContainerAction('${id}','restart')" type="button" class="btn btn-warning" data-dismiss="modal">Restart</button>
        <button onclick="triggerContainerAction('${id}','pause')" type="button" class="btn btn-info" data-dismiss="modal">Pause</button>
        <button onclick="triggerContainerAction('${id}','stop')" type="button" class="btn btn-danger" data-dismiss="modal">Stop</button>`
    }

    $('#modalFooter').html(modalFooter);
}

// containers actions

function showContainerDetails(id) {
    // showmodal
    let container = containers.find(c => c.Id == id);
    showModal(container);
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
        <span onclick="showContainerDetails('${container.Id}')" data-feather="info"></span>
    </div>
    <div class="card-body">
        <p class="card-text"><strong>ID: </strong>${container.Id}</p>
        <p class="card-text"><strong>Base Image: </strong>${container.Image}</p>
        <a onclick="showContainerDetails('${container.Id}')" href="#">More...</a>
    </div></div>`
    return containerHtmlTemplate;
}
function loadContainers(containers, filter) {
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
function loadFlaskVars(vars) {
    containers = vars['containers'];
    loadContainers(containers, currentFilter);
}

function refresh() {
    xhr.open('GET', `http://localhost:8000/containers/json`, true);
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                containers = JSON.parse(xhr.responseText)['containers'];
                loadContainers(containers, currentFilter);
                dump(xhr.responseText)
            }
            else
                dump("Error procesing petition");
        }
    };
    xhr.send(null);
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

// ***************************** CREATION SECTION *****************************

