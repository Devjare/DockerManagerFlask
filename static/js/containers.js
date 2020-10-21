// TODO: ADD XMLHTTPREQUEST object to the top to make it global
// TODO: ADD builder.html

var xhr = new XMLHttpRequest();

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
                console.log(`${action}ing container: ${id}`);
                dump(xhr.responseText)
            }
            else
                dump("Error procesing petition");
        }
    };
    xhr.send(null);
}

// ********************* UTILS ********************* 

function portsArrayToString(portsArray) {
    str = "";
    portsArray.forEach(port => { 
        str += JSON.stringify(port) + ", ";
    });
    return str;
}

// Convert from unix timestamp to normal date format
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}
// ********************* END UTILS ********************* 

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
    <button onclick="triggerContainerAction('${id}','start')" type="button" class="btn btn-primary">Start</button>`
    } else if(state == 'paused') {
        modalFooter += `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button onclick="triggerContainerAction('${id}','unpause')" type="button" class="btn btn-info">Unpause</button>
        <button onclick="triggerContainerAction('${id}','stop')" type="button" class="btn btn-danger">Stop</button>`
    } else if(state == 'running') {
        modalFooter += `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button onclick="triggerContainerAction('${id}','restart')" type="button" class="btn btn-warning">Restart</button>
        <button onclick="triggerContainerAction('${id}','pause')" type="button" class="btn btn-info">Pause</button>
        <button onclick="triggerContainerAction('${id}','stop')" type="button" class="btn btn-danger">Stop</button>`
    }

    $('#modalFooter').html(modalFooter);
}

// containers actions

function showContainerDetails(id) {
    // showmodal
    let container = containers.find(c => c.Id == id);
    console.log('container with id: ', id, ', found: ', container);
    showModal(container);
    $('#modal').ready(() => {
        $('#modalFooter > #btnLaunchContainer').click((e) => {
            triggerContainerAction(id, 'start');
        });
    });
}

var containersIds;
var containers;

function buildContainerTableRow(container) {
    let template = `<tr>
      <th scope="row">1</th>
      <td>${container.Id}</td>
      <td>${container.Names[0]}</td>
      <td>${container.State}</td>
      <td>${container.Ports[0]?"NONE":container.Ports[0]}</td>
      <td><a href="#" id="${container.Id}" class="popover-item" data-placement="bottom" data-toggle="popover" title="Image Info" data-content="ID: ${container.ImageID}">${container.Image}</a></td>
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
<div class="card-header ${cardHeaderClasses} grid-card-header">
    ${container.Names} (${state})
    <span onclick="showContainerDetails('${container.Id}')" data-feather="info"></span>
</div>
<div class="card-body">
<p class="card-text"><strong>ID: </strong>${container.Id}</p>
<p class="card-text"><strong>Base Image: </strong>${container.Image}</p>
<a onclick="showContainerDetails('${container.Id}')" href="#">More...</a></div></div>`
    return containerHtmlTemplate;
}
function loadContainers(containers) {
    clearContainersPanel();
    containers.forEach(c => {
        rowsTemplate = buildContainerTableRow(c);
        document.querySelector('.table-body').innerHTML += rowsTemplate;

        gridTemplate = buildContainerHtmlTemplate(c);
        document.querySelector('#containersGrid > div').innerHTML += gridTemplate;

        document.getElementById('containersGrid').style.display="none";
        document.getElementById('containersList').style.display="flex";
        feather.replace();
    });
}
function loadFlaskVars(vars) {
    containers = vars['containers'];
    loadContainers(containers);
}

function refresh() {
    xhr.open('GET', `http://localhost:8000/containers/json?all=True&since=relaxed_wilson`, true);
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                console.log('response on refresh: ', xhr.responseText);
                containers = JSON.parse(xhr.responseText)['containers'];
                console.log('refresh containers: ', containers);
                loadContainers(containers);
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
}

function filterContainersBy(state) {
    filtered = [];
    if(state == 'created/exited') 
        filtered = containers.filter(c => c.State == 'created' || c.State == 'exited');
    else 
        filtered = containers.filter(c => c.State == state);

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
    document.querySelector('.table-body').innerHTML = '';
}

function showContainerDetailsRight(id) {
    console.log('container details to show: ', id);
    document.getElementById('rightPanel').style.width = "500px";

}

function hideLaunchDetailsPanel() {
    document.getElementById('rightPanel').style.width = "0";
}

document.getElementById('btnLaunch').onclick = hideLaunchDetailsPanel;
