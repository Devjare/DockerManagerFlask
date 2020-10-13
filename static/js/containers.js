console.log('Containers JS');
// TODO: use this techniche, changing dynamically classes
// and set the transition works the same as with ":hover"
// JS EXAMPLE
// document.getElementById('btn').onclick = (e) => {  if(document.getElementById('somebs').classList.contains('someshit-atleft')) {
//   document.getElementById('somebs').classList.remove("someshit-atleft");
//  } else {
//    document.getElementById('somebs').classList.add("someshit-atleft");
//  }
// }
//
// CSS EXAMPLE
// .someshit {
//   width: 100px;
//   height: 100px;
//   background: blue;
//   
//   transition: margin-left 2s;
// }
// 
// .someshit-atleft {
//   margin-left: 50px;
// }
// // HTML EXAPMLE
// <button id="btn">Move that shit</button>
// <div id="somebs" class="someshit">
// <div>
// TODO: LOAD CONTAINERS AND PUT THEM ON THE containers.html
// TODO: ADD builder.html 
// TODO: ADD FUNCTIONALITY TO containers.html

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
        <button id="restart-${containerinfo.id}" class="btn btn-warning" onclick="showLaunchDetails(event, '${containerinfo.id}')">Restart</button>
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
// TODO: use jinja, like here:
//    {% if siloStatus == 200: %}
//    <div class="card-columns">
//        {% for image in images.repositories %} 
//            <div class="card bg-light mb-3" style="max-width: 18rem;">
//                <div class="card-header">UC-{{ image }}</div>
//                <div class="card-body">
//                    <h5 class="card-title">{{ image }}</h5>
//                    <!--<p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>-->
//                </div>
//            </div>
//        {% endfor %}
//    </div>
//    {% else %}
//        <h4 class="text-center text-primary">Error al obtener las imágenes del silo!</h4>
//        {% if images: %}
//            <p>{{ images.error }}</p>
//        {% endif %} 
//    {% endif %}

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

addContainer({"name": "Python Server", "Timeactive": "24H"});

function addContainer(containerinfo) {
    console.log('container info: ', containerinfo);
}

// function to show launch details panel.
function showLaunchDetails(event, containerId) {
    event.preventDefault();
    console.log('container details to show: ', containerId);
    document.getElementById('rightPanel').style.right = "0px";
}

function hideLaunchDetailsPanel() {
    document.getElementById('rightPanel').style.right = "-600px";
}

document.getElementById('rightPanel').onclick = (e) => {
    e.stopPropagation();
    return false;
}

document.getElementById('btnLaunch').onclick = hideLaunchDetailsPanel;
document.onclick = (e) => {
    e.stopPropagation();
    // hideLaunchDetailsPanel();
};
