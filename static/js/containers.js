console.log('Containers JS');
// TODO: ADD builder.html
// TODO: ASK FOR WHICH INFO NEEDS TO BE DISPLAYED, SINCE DOCKER LIBRARY FOR PYTHON
// DOESN'T SHOW EVERY DETAIL(FOR PETITON OF DOC IVAN ON THE DOCKER INSPECT COMMAND,
// THE LIBRARY DOESN'T SHOW EVEN HALF OF THE INFORMATION COMPARED TO DOCKER INSPECT)
// TODO: ADD LIST VIEW OPTION TO CONTAINER PANEL

function launchContainer(id) {
    var req = new XMLHttpRequest();
    req.open('GET', `http://localhost:8000/containers/start/${id}`, true);
    req.onreadystatechange = (e) => {
        if(req.readyState == 4) {
            if(req.status == 200) 
                dump(req.responseText)
            else
                dump("Error procesing petition");
        }
    };
    req.send(null);
}

// containers actions

function startContainer(id) {
    console.log('starting container');
    console.log(id);

    // showmodal
    $('#modal').modal('show');
    $('#modal').ready(() => {
        $('#modalFooter > #btnLaunchContainer').click((e) => {
            alert(`launching container: ${id}`);
            launchContainer(id);
        });
    });
}

function showmodal() {
}

function restartContainer(id) {
    console.log('restarting container: ', id);
}

function stopContainer(id) {
    console.log('stoping container: ', id);
}

function pauseContainer(id) {
    console.log('pausing container: ', id);
}

var containersIds;
var containers;
function buildContainerHtmlTemplate(containerinfo) {

    let cardHeaderClasses = "";
    if(containerinfo.status == "running") cardHeaderClasses = "bg-success text-white"
    else if(containerinfo.status == "paused") cardHeaderClasses = "bg-info text-white"
    else if(containerinfo.status == "dead") cardHeaderClasses = "bg-danger text-white"
    else if(containerinfo.status == "restarting") cardHeaderClasses = "bg-warning"

    let cardActionButton = "";
    if(containerinfo.status == "running") {
        cardActionButton = `
        <button onclick="pauseContainer('${containerinfo.id}')" class="btn btn-info">Pause</button>
        <button onclick="restartContainer('${containerinfo.id}')" class="btn btn-warning">Restart</button>
        <button onclick="stopContainer('${containerinfo.id}')" class="btn btn-danger">Stop</button>`;
    }
    else if(containerinfo.status == "paused") { 
        cardActionButton = `
        <button onclick="startContainer('${containerinfo.id}')" class="btn btn-success">Start</button>
        <button onclick="restartContainer('${containerinfo.id}')" class="btn btn-warning">Restart</button>`
    }
    else if(containerinfo.status == "dead") { 
        cardActionButton = `
        <button class="btn btn-success" onclick="startContainer('${containerninfo.id}')">Start</button>
        <button onclick="restartContainer('${containerinfo.id}')" class="btn btn-warning">Restart</button>`
    }
    else if(containerinfo.status == "restarting") cardActionButton = "";
    else cardActionButton = `<button onclick="startContainer('${containerinfo.id}')" class="btn btn-success">Start</button>`

    var containerHtmlTemplate = `
<div id="${containerinfo.id}" class="card">
<div class="card-header ${cardHeaderClasses} grid-card-header">
    ${containerinfo.name} (${containerinfo.status})
    <span onclick="showContainerDetails('${containerinfo.id}')" data-feather="info"></span>
</div>
<div class="card-body">
<p class="card-text"><strong>ID: </strong>${containerinfo.id}</p>
<p class="card-text"><strong>Base Image: </strong>${containerinfo.image.id}</p>
${cardActionButton}</div></div>`
    return containerHtmlTemplate;
}
function loadContainers(containers) {
    // query to API to get containers of user.
    containers.forEach(c => {
        template = buildContainerHtmlTemplate(c);
        document.querySelector('#containersGrid > div').innerHTML += template;
    });
}
function loadFlaskVars(vars) {
    containers = vars.map(c => { return JSON.parse(c) });
    console.log('containers: ', containers);
    loadContainers(containers);
}

function showContainerDetails(id) {
    console.log('showing details of: ', id);
}

function refresh() {
    console.log('refreshing containers list');
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
}

function filterContainersBy(state) {
    filtered = [];
    if(state == 'created/exited') 
        filtered = containers.filter(c => c.status == 'created' || c.status == 'exited');
    else 
        filtered = containers.filter(c => c.status == state);

    console.log(`filtered containers by: ${state}`, filtered)
    return filtered;
}

function filterBy(state) {
   clearContainersPanel();
   filteredContainers = filterContainersBy(state);
   loadContainers(filteredContainers);
}

function clearContainersPanel() {
    // Delete all cards from container panel.
    document.querySelector('#containersGrid > .card-columns').innerHTML = '';
}


// function to show launch details panel.
function showLaunchDetails(containerId) {
    console.log('container details to show: ', containerId);
    document.getElementById('rightPanel').style.width = "500px";
    // document.getElementById('rightPanel').style.display = "flex";
}

function hideLaunchDetailsPanel() {
    document.getElementById('rightPanel').style.width = "0";
    // document.getElementById('rightPanel').style.display = "none";
}

document.getElementById('btnLaunch').onclick = hideLaunchDetailsPanel;
