console.log('Containers JS');
// TODO: ADD builder.html
// TODO: ASK FOR WHICH INFO NEEDS TO BE DISPLAYED, SINCE DOCKER LIBRARY FOR PYTHON
// DOESN'T SHOW EVERY DETAIL(FOR PETITON OF DOC IVAN ON THE DOCKER INSPECT COMMAND,
// THE LIBRARY DOESN'T SHOW EVEN HALF OF THE INFORMATION COMPARED TO DOCKER INSPECT)
// TODO: ADD LIST VIEW OPTION TO CONTAINER PANEL
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
        <button id="pause-${containerinfo.id}" class="btn btn-info">Pause</button>
        <button id="restart-${containerinfo.id}" class="btn btn-warning" onclick="showLaunchDetails('${containerinfo.id}')">Restart</button>
        <button id="stop-${containerinfo.id}" class="btn btn-danger">Stop</button>`;
    }
    else if(containerinfo.status == "paused") { 
        cardActionButton = `
        <button id="start-${containerinfo.id}" class="btn btn-success" onclick="showLaunchDetails('${containerinfo.id}')">Start</button>
        <button id="restart-${containerinfo.id}" class="btn btn-warning" onclick="showLaunchDetails('${containerinfo.id}')">Restart</button>`
    }
    else if(containerinfo.status == "dead") { 
        cardActionButton = `
        <button id="start-${containerinfo.id}" class="btn btn-success" onclick="showLaunchDetails('${containerinfo.id}')">Start</button>
        <button id="restart-${containerinfo.id}" class="btn btn-warning" onclick="showLaunchDetails('${containerinfo.id}')">Restart</button>`
    }
    else if(containerinfo.status == "restarting") cardActionButton = "";
    else cardActionButton = `<button id="start-${containerinfo.id}" class="btn btn-success" onclick="showLaunchDetails('${containerinfo.id}')">Start</button>`

    var containerHtmlTemplate = `
<div class="card">
<div class="card-header ${cardHeaderClasses}"> ${containerinfo.name} (${containerinfo.status})</div>
<div class="card-body">
<p class="card-text"><strong>ID: </strong>${containerinfo.id}</p>
<p class="card-text"><strong>Base Image: </strong>${containerinfo.image.id}</p>
${cardActionButton}</div></div>`
// <div class="card-footer">
// <small class="text-muted">Time Active: ${containerinfo.timeactive}</small>
// </div></div>`
    return containerHtmlTemplate;
}
function loadContainers(containers) {
    // query to API to get containers of user.
    containers.forEach(c => {
        template = buildContainerHtmlTemplate(c);
        document.querySelector('#containersPanel > div').innerHTML += template;
    });
}
function loadFlaskVars(vars) {
    containers = vars.map(c => { return JSON.parse(c) });
    console.log('containers: ', containers);
    loadContainers(containers);
}

var containersList = [
    {"id": "80DF7765HLIJK", "name": "Python Server For WEBAPI", "timeactive": "3h","status":"created"}, 
    {"id": "99DFJAKFJ123D", "name": "Java Server For Photography site", "timeactive": "3d","status":"exited"},
    {"id": "ASD912LOKF233", "name": "Go Server For Files Management", "timeactive": "24h","status":"restarting"},
    {"id": "OECNJR28491HF", "name": "Store Management Storage", "timeactive": "24min","status":"dead"},
    {"id": "1H28HF03HF73H", "name": "CSGO Deathmatch server", "timeactive": "1week","status":"paused"},
    {"id": "POMKHFH1371HF", "name": "Another Server :(", "timeactive": "6s","status":"running"},
]

function refresh() {
    console.log('refreshing containers list');
}

function formatView(format) {
    console.log(`now viewing in format ${format}`);
}

function filterContainersBy(state) {
    filtered = [];
    if(state == 'created/exited') 
        filtered = containersList.filter(c => c.status == 'created' || c.status == 'exited');
    else 
        filtered = containersList.filter(c => c.status == state);

    console.log(`filtered containers by: ${state}`, filtered)
    return filtered;
}

function filterBy(state) {
   // clearContainersPanel();
   // filteredContainers = filterContainersBy(state);
   // loadContainers(filteredContainers);
}

function clearContainersPanel() {
    // Delete all cards from container panel.
    document.querySelector('#containersPanel > .card-columns').innerHTML = '';
}

// suppouse the containers load

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
