console.log('Containers JS');
// TODO: ADD builder.html
//
// TODO: ADD LIST VIEW OPTION TO CONTAINER PANEL
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
<p class="card-text"><strong>TimeActive: </strong>${containerinfo.timeactive}</p>
${cardActionButton}</div>
<div class="card-footer">
<small class="text-muted">Time Active: ${containerinfo.timeactive}</small>
</div></div>`
    return containerHtmlTemplate;
}
// suppouse the containers load
loadContainers();
function loadContainers() {
    // query to API to get containers of user.
    containersList = [
        {"id": "80DF7765HLIJK", "name": "Python Server For WEBAPI", "timeactive": "3h","status":"created"}, 
        {"id": "99DFJAKFJ123D", "name": "Java Server For Photography site", "timeactive": "3d","status":"exited"},
        {"id": "ASD912LOKF233", "name": "Go Server For Files Management", "timeactive": "24h","status":"restarting"},
        {"id": "OECNJR28491HF", "name": "Store Management Storage", "timeactive": "24min","status":"dead"},
        {"id": "1H28HF03HF73H", "name": "CSGO Deathmatch server", "timeactive": "1week","status":"paused"},
        {"id": "POMKHFH1371HF", "name": "Another Server :(", "timeactive": "6s","status":"running"},
    ]

    containersList.forEach(c => {
        console.log('container: ', c);
        template = buildContainerHtmlTemplate(c);
        console.log('template', template);
        document.querySelector('#containersPanel > div').innerHTML += template;
    });
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
