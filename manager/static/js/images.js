$('.site-content').ready((e) => {
    loadAllImages();
    loadRegistry();
});

var images = [];
var repositories = [];
var dockerhubRepositories = [];

function loadAllImages() {
    let reqObj = {
        'type': 'GET',
        'url': `http://localhost:8000/images/json?all=True`,
        'isAsync': false,
        'params': null
    };
    sendRequest(reqObj, 
        (response) => {
            images = JSON.parse(response).images;
            loadImages(JSON.parse(response).images);
            feather.replace();
        },
        (error) => console.log('error: ', error));
}

function loadImages(imagesArr) {
    let index = 0;
    imagesArr.forEach(image => {
        template = buildImageTableTemplate(index, image);
        $('#images-table').append(template);
        index++;
    });
}

function refreshImageTable() {
    $('#images-table').empty();
    loadAllImages(); 
}

// function to validate format of various input texts
function validatseField(field) {
    let invalidChars = [' ', '.', '#', '$', '^', `'`, '!', '@', '%', '&', '*', ')', '(', '=', '+'];
    if(field == 'name') {
        let value = $(`#${field}`).value;
        if(value.includes(' ')) {
            
        }
    }
}
function showImageModal(imageid, action) {
    $('#modalTitle').empty(); 
    $('#modalBody').empty();
    $('#modalFooter').empty();
  
    let modalBody = '';
    let modalFooter = '';
    let modalTitle = '';
    if(action == 'tag_image') {
        modalTitle = 'Tag image';
    } else if(action == 'create_container') {
        modalTitle = 'Create container'
        modalBody = `
            <div class="m-2 form-group">
                <label for="selectTag"> Select Tag</label>
                <select id="selectTag">
                </select>
            </div>
            <div class="m-2 form-group">
                <label for="containername">Container name</label>
                <input id="containername" class="form-control" type="text" placeholder="Container name" onchange="validateField('name')">
            </div>
            <div class="m-2 form-group">
                <label for="ports">Ports</label>
                <input id="ports" class="form-control" type="text" placeholder="<container_port>:<host_port>" onchange="validateField('ports')">
            </div>
            <div class="m-2 form-group">
                <label for="volume">Volume</label>
                <input id="volume" class="form-control" type="text" placeholder="<host_path>:<bind>:<mode> (e.g. /data/:/:ro)" onchange="validateField('volume')">
            </div>
            <div class="m-2 form-group">
                <label for="command">Command</label>
                <input id="command" class="form-control" type="text" placeholder="Command to run in container">
            </div>
             <div class="form-check">
                <input type="checkbox" class="form-check-input" id="chkTty">
                <label class="form-check-label mt-1" for="chkRun">Entable TTY?</label>
            </div>
        `;
        modalFooter = `
            <div class="d-flex justify-content-between w-100">
             <div class="form-check">
                <input type="checkbox" class="form-check-input" id="chkRun">
                <label class="form-check-label mt-1" for="chkRun">Create and Run?</label>
            </div>
            <div>
                <a href="/container_creation">Advance Creation</a>
                <button onclick="createContainerFrom('${imageid}')" class="btn btn-sm btn-primary">Create Container</button>
            </div>
            </div>
        `;
        $('#modalBody').ready(e => {
            // Add tags when the modal loads.
            images.find(img => img.Id == imageid).RepoTags.forEach(tag => {
                $('#selectTag').append(new Option(tag, tag));
            });
        });
    } else {
        modalTitle = 'Save image';
    }
     
    $('#modalTitle').text(modalTitle); 
    $('#modalBody').append(modalBody);
    $('#modalFooter').append(modalFooter);
    $('#modal').modal('show');
}

function createContainerFrom(imageid) {
    // get all image data.
    $('#modalConfirm').modal('show');
    $('#modalConfirm .modal-body').empty();
    $('#modalConfirm .modal-body').append('<h5>If a field is left empty, container will be created anyway but without that argument. Do you want to continue?</h5>');
    $('#modal').css({'z-index': '0'});
    
    $('#modalConfirm').on('hidden.bs.modal', (e) => {
        $('#modal').css({'z-index': ''});
    });

    $('#modalConfirm .btn-primary').click((e) => { 
    
        let data = {
            'image': $('#selectTag')[0].value.toString(),
            'name': $('#containername')[0].value.toString(),
            'ports': $('#ports')[0].value.toString(),
            'volume': $('#volume')[0].value.toString(),
            'command': $('#command')[0].value.toString(),
            'tty': $('#chkTty')[0].checked,
            'run': $('#chkRun')[0].checked
        };

        let reqObj = {
            'type': 'POST',
            'url': `/containers/create`,
            'isAsync': true,
            'params': JSON.stringify(data),
            'requestHeaders': { 'Content-Type': 'application/json' }
        };

        sendRequest(reqObj, 
            (response) => $('#modal').modal('hide'),
            (error) => console.log('error: ', error));

        $('#modalConfirm').modal('hide');
        $('#modal').css({'z-index': ''});
    });
    
    $('#modalConfirm .btn-secondary').click((e) => {
        $('#modalConfirm').modal('hide');
        $('#modal').css({'z-index': ''});
    });
}

function buildImageTableTemplate(index, image) {
    let sizeOnMb = Number((image['Size'] / 1000000).toFixed(1));
    let tagsStr = image['RepoTags'].toString();
    let created = timeConverter(image['Created']);
    let template = `
    <tr class="d-flex">
        <td class="col-s-1 d-flex align-items-center" scope="row">${index}</td>
        <td class="col-s-1 d-flex align-items-center" scope="row">
            <span class="icon" onclick="showDeleteImageModal('${image.Id}')" data-feather="trash"></span>
        </td>
        <td class="col-5 d-flex align-items-center text-truncate">${image['Id']}</td>
        <td class="col-3 text-truncate d-flex align-items-center">${tagsStr}</td>
        <td class="col-1 d-flex align-items-center">${created}</td>
        <td class="col-1 d-flex align-items-center">${sizeOnMb} MB</td>
        <td class="col-3 d-flex align-items-center">
        <a onclick="showImageModal('${image["Id"]}', 'tag_image')">Tag Image</a> |
        <a onclick="showImageModal('${image["Id"]}', 'create_container')" href="#"> Create Container </a> |
        <a onclick="showImageModal('${image["Id"]}', 'save_image')">Save Image</a>
        </td>
    </tr>`
    return template;
}

var currentView = 'registry';
// change registry/dockerhub repositroy view.
function searchOn() {
    let searchFor = $('#registrySearchType')[0].value;

    if(searchFor == "dockerhub") {
        $('#rep-dockerhub').toggle();
        $('#rep-1-tab').toggle();
    } else {
        $('#rep-dockerhub').toggle();
        $('#rep-1-tab').toggle();
    }
    
    currentView = searchFor;
}

function searchImages() {
    let text = $('#searchImagesText')[0].value;
}

function searchRegistry() {
    let text = $('#searchRegistryText')[0].value;

    if(currentView == "dockerhub") {
        searchOnDockerhub(text);
    } else {
        alert('looking on private registry');
    }
}

function deleteImage() {
    let toDelete = $('#imageTag')[0].value;
    let noPrune = $('#chkNoPrune')[0].checked;
    let force = $('#chkForce')[0].checked;

    let reqObj = {
        'type': 'GET',
        'url': `http://localhost:8000/images/delete?imagerepo=${toDelete}&noprune=${noPrune}&force=${force}`,
        'isAsync': true,
        'params': null
    };

    sendRequest(reqObj, 
        (response) => {
            showAlert('Image deleted successfully!', 'success');
            refreshImageTable();
        },
        (error) => console.log('error: ', error));
}

function showDeleteImageModal(imageid) {
    // from registry
    $('#modal').modal('show'); 
    $('#modalTitle').empty();
    $('#modalBody').empty();
    $('#modalFooter').empty();

    let body = `<h5>Select tag to delete: </h5><select id="imageTag">`;
    console.log('images: ', images);
    images.find(i => i.Id == imageid).RepoTags.forEach(t => body += `<option value="${t}">${t}</option>`);
    body += `</select>
    <div class="form-check">
        <input type="checkbox" class="form-check-input" id="chkNoPrune">
        <label class="form-check-label mt-1" for="chkNoPrune">Delete untagged parents?</label>
    </div>
    <div class="form-check">
        <input type="checkbox" class="form-check-input" id="chkForce">
        <label class="form-check-label mt-1" for="chkForce">Force removal?</label>
    </div>`;
    
    let footer = `
        <button onclick="deleteImage()" class="btn btn-primary" data-dismiss="modal">Delete</button>
         <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>`;   

    $('#modalTitle').text('Delete image');
    $('#modalBody').append(body);
    $('#modalFooter').append(footer);
}

function showPullImageModal(imageName, source) {
    // from registry
    $('#modal').modal('show'); 
    $('#modalTitle').empty();
    $('#modalBody').empty();
    $('#modalFooter').empty();

    let body = '';
    if(source == 'dockerhub') {
        body += `
        <div class="input-form">
        ${imageName}: 
        <select id="imageTag">`;
        dockerhubRepositories[imageName].tags.forEach(t => body += `<option value="${t}">${t}</option>`);
        body += '</select></div>'
    } else {
        body += `
        <div class="input-form">${imageName}: <select id="imageTag">`;
        repositories[imageName].forEach(t => body += `<option value="${t}">${t}</option>`);
        body += '</select></div>'
    }
    
    let footer = `
        <button onclick="pullImage('${imageName}', '${source}')" class="btn btn-primary" data-dismiss="modal">Pull</button>
         <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>`;   

    $('#modalTitle').text('Pull image');
    $('#modalBody').append(body);
    $('#modalFooter').append(footer);
}

function pullImage(imageRep, source) {
    // rep + tag = imageToPull
    let imageToPull = `${source=='registry'?'localhost:5000/':''}${imageRep}:${$('#imageTag')[0].value}`;

    
    let reqObj = {
        'type': 'GET',
        'url': `http://localhost:8000/images/pull?repname=${imageToPull}&source=${source}`,
        'isAsync': true,
        'params': null
    };

    sendRequest(reqObj, 
        (response) => refreshImageTable() ,
        (error) => console.log('error: ', error));
}

function loadRegistryRepositories(repositories) {
    let index = 0;
    let table = $('#rep-1-table');
    for(let rep in repositories) {
        let template = `
        <tr class="d-flex">
            <td class="col-s-1">${index}</td>
            <td class="col-5">${rep}</td>
e           <td class="col-5">${repositories[rep].toString()}</td>
            <td class="col-2 d-flex justify-content-center">
                <a href="#" onclick="showPullImageModal('${rep}', 'registry')">pull</a>
            </td>
        </tr>`;
        table.append(template);
        index++; 
    }
}

function loadDockerhubRepositories(repositories) {
    let index = 0;
    let table = $('#dockerhubRepsTable');
    table.empty();
    for(let repName in repositories) {
        let template = `
        <tr class="d-flex">
            <td class="col-s-1">${index}</td>
            <td class="col-3">${repositories[repName]['name']}</td>
            <td class="col-4">${repositories[repName]['description']}</td>
            <td class="col-1">${repositories[repName]['stars']}</td>
            <td class="col-1">${repositories[repName]['official']}</td>
            <td class="col-1">${repositories[repName]['automated']}</td>
            <td class="col-2 d-flex justify-content-center">
                <a href="#" onclick="showPullImageModal('${repName}', 'dockerhub')">Pull</a>
            </td>
        </tr>`;

        table.append(template);
        index++; 
    }
}

function loadRegistry() {
    let reqObj = {
        'type': 'GET',
        'url': 'http://localhost:8000/registry?source=registry',
        'isAsync': false,
        'params': null
    };

    sendRequest(reqObj, 
        (response) => {
            repositories = JSON.parse(response).repositories;
            loadRegistryRepositories(repositories);
        },
        (error) => console.log('error: ', error));
}

function searchOnDockerhub(text) {
    let reqObj = {
        'type': 'GET',
        'url': `http://localhost:8000/registry?source=dockerhub&text=${text}`,
        'isAsync': true,
        'params': null
    };

    sendRequest(reqObj, 
        (response) => {
            dockerhubRepositories = JSON.parse(response).repositories;
            loadDockerhubRepositories(dockerhubRepositories);
        },
        (error) => console.log('error: ', error));    
}
