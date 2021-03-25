$('.site-content').ready((e) => {
    loadAllImages();
    loadRegistry();
});


var images = [];
var repositories = [];
var dockerhubRepositories = [];

function findImagesBy(pattern) {
    return images.filter(i => 
        i.Id.includes(pattern)  
        || i.RepoDigests.toString().includes(pattern) 
        || i.RepoTags.toString().includes(pattern));
}

function goToDetailsOf(image, textType) {
    // split text in case multiple tags are loaded.
    // any tag used will result on the same data.
    if(textType == 'tag') localStorage.setItem('image', image);
    else {
        // get the tags of the current image id
        name = images.find(i => i.Id == image).RepoTags.toString(); 
        localStorage.setItem('image', name);
    }

    location.href = '/images/details';
}

function loadAllImages() {
    let reqObj = {
        'type': 'GET',
        'url': `/images/json?all=True`,
        'isAsync': false,
        'params': null
    };
    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) {
                showAlert('An error occurred loading image info! Check console logs.', 'danger');
                console.log('Error loading image info: ', res['error']);
            }
            else {
                images = res.images;
                loadImages(images);
                showAlert('Images loaded succesfully', 'success');

                imagesNames = images.map(i => i.RepoTags.toString());
                localStorage.setItem('images_list', imagesNames);
            }
        },
        (error) => { 
            console.log('error: ', error);
            showAlert(`An error occurred, check console.`, 'danger');
        });
}

function loadImages(imagesArr) {
    $('#images-table').empty();
    let index = 0;
    imagesArr.forEach(image => {
        template = buildImageTableTemplate(index, image);
        $('#images-table').append(template);
        index++;
    });
    feather.replace();
}

function refreshImageTable() {
    loadAllImages(); 
}

function showImageModal(imageid, action) {
    let body = '';
    let footer = '';
    let title = '';

    if(action == 'tag_image') {
        title = 'Tag image';
    } else if(action == 'create_container') {
        title = 'Create container'
        body = `
            <div class="m-2 form-group">
                <label for="selectTag"> Select Tag</label>
                <select id="selectTag" class="form-control">
                </select>
            </div>
            <div class="m-2 form-group">
                <label for="containername">Container name</label>
                <input id="containername" class="form-control" type="text" placeholder="Container name"
                pattern="[\\w_-]+$" oninput="setCustomValidity('')">
            </div>
            <div class="m-2 form-group">
                <label for="ports">Ports</label>
                <input id="ports" class="form-control" type="text" placeholder="<container_port>:<host_port>"
                pattern="[0-9\\/tcpudpTCPUDP]+:[0-9\\/tcpupdTCPUDP]+" oninput="setCustomValidity('')">
            </div>
            <div class="m-2 form-group">
                <label for="volume">Volume</label>
                <input id="volume" class="form-control" type="text" placeholder="<host_path>:<bind>:<mode> (e.g. /data/:/:ro)" 
                pattern="[\\w\\-\\\\\/]+:[\\w\\-\\\\\/]+:[row]+$" oninput="setCustomValidity('')">
            </div>
            <div class="m-2 form-group">
                <label for="command">Command</label>
                <input id="command" class="form-control" type="text" placeholder="Command to run in container"
                pattern="[\\w\\-\\\\\/]+:[\\w\\-\\\\\/]+:[row]+$" oninput="setCustomValidity('')">
            </div>
             <div class="form-check">
                <input type="checkbox" class="form-check-input mr-1" id="chkTty">
                <label class="form-check-label mt-1 ml-2" for="chkTty">Entable TTY?</label>
            </div>
        `;
        footer = `
            <div class="d-flex justify-content-between w-100">
             <div class="form-check">
                <input type="checkbox" class="form-check-input" id="chkRun">
                <label class="form-check-label mt-1 ml-2" for="chkRun">Create and Run?</label>
            </div>
            <div>
                <a href="/containers/creation">Advanced Creation</a>
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
        title = 'Save image';
    }

    showModal(title, body, footer);
}

function createContainerFrom(imageid) {
    // get all image data.
    showConfirmationModal(
        'If a field is left empty, container will be created anyway but without that argument. Do you want to continue?',
        (e) => { 
            let data = { 'image': $('#selectTag')[0].value.toString() };

            let name = $('#containername')[0].value.toString();
            let ports = $('#ports')[0].value.toString();
            let volume = $('#volume')[0].value.toString();
            let command = $('#command')[0].value.toString();

            if(name) data['name'] = name;
            if(ports) data['ports'] = ports;
            if(volume) data['volume'] = volume;
            if(command) data['command'] = command;

            data['tty'] = $('#chkTty')[0].checked;
            data['run'] = $('#chkRun')[0].checked;

            let reqObj = {
                'type': 'POST',
                'url': `/containers/create`,
                'isAsync': true,
                'params': JSON.stringify(data),
                'requestHeaders': { 'Content-Type': 'application/json' }
            };

            sendRequest(reqObj, null,
                (response) => {
                    console.log('create response: ', response);
                    let res = JSON.parse(response.srcElement.response);
                    if('error' in res) {
                        showAlert('An error occurred creating container! Check console logs.', 'danger');
                        console.log('error: ', res['error']);
                    }
                    else {
                        hideModal();
                        showAlert('Container created successfully!', 'success');
                        location.href = '/containers';
                    }
                },
                (error) => {
                    showAlert('An error occurred making a request!', 'danger');
                    console.log('error: ', error);
                });

            hideConfirmationModal();
            hideModal();
        }, 
        (e) => {
            hideConfirmationModal();
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
            <span class="icon mx-1" onclick="showDeleteImageModal('${image.Id}')" data-feather="trash"></span>
        </td>
        <td class="col-5 d-flex align-items-center text-truncate">
        <a href="#" onclick="goToDetailsOf('${image['Id']}', 'id')">${image['Id']}</a></td>
        <td class="col-3 text-truncate d-flex align-items-center">
        <a href="#" onclick="goToDetailsOf('${tagsStr}', 'tag')">${tagsStr}</a></td>
        <td class="col-1 d-flex align-items-center">${created}</td>
        <td class="col-1 d-flex align-items-center">${sizeOnMb} MB</td>
        <td class="col-3 d-flex align-items-center">
        <a onclick="showImageModal('${image["Id"]}', 'create_container')" href="#"> Create Container </a>
        </td>
    </tr>`
    return template;
}

var currentView = 'registry';
function searchOn() {
    let searchFor = $('#registrySearchType')[0].value;

    if(searchFor == "dockerhub") {
        $('#rep-dockerhub').toggle();
        $('#rep-1-tab').toggle();
        $('#searchRegistryText').toggle();
        $('#searchDockerhubText').toggle();
    } else {
        $('#rep-dockerhub').toggle();
        $('#rep-1-tab').toggle();
        $('#searchRegistryText').toggle();
        $('#searchDockerhubText').toggle();
    }

    currentView = searchFor;
}

function searchImages() {
    let text = $('#searchImagesText')[0].value;
    loadImages(findImagesBy(text));
}

function searchRegistry() {
    let text = $('#searchRegistryText')[0].value;

    let filteredRepos = {};
    for(key in repositories) {
        if(key.includes(text) || repositories[key].toString().includes(text)) 
            filteredRepos[key] = repositories[key];
    }
    loadRegistryRepositories(filteredRepos);
}

function searchDockerhub(event) {
    if(event.keyCode == 13) {
        let text = $('#searchDockerhubText')[0].value;
        searchOnDockerhub(text); 
    }
}

function deleteImage() {
    let toDelete = $('#imageTag')[0].value;
    let noPrune = $('#chkNoPrune')[0].checked;
    let force = $('#chkForce')[0].checked;

    let reqObj = {
        'type': 'GET',
        'url': `/images/delete?imagerepo=${toDelete}&noprune=${noPrune}&force=${force}`,
        'isAsync': true,
        'params': null
    };

    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) {
                showAlert('An error occurred deleting the image! Check console logs.', 'danger');
                console.log('error: ', res['error']);
            }
            else {
                showAlert('Image deleted successfully!', 'success');
                refreshImageTable();
            }
        },
        (error) => {
            console.log('error: ', error);
            showAlert(`An error occurred, check console`, 'danger'); 
        });
}

function showDeleteImageModal(imageid) {
    let title = 'Delete image';

    let body = `<h5>Select tag to delete: </h5><select id="imageTag" class="form-control">`;
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

    showModal(title, body, footer);
}

function showPullImageModal(imageName, source) {
    let title = 'Pull image';

    let body = '';
    if(source == 'dockerhub') {
        body += `
        <div class="input-form">
        ${imageName}: 
        <select id="imageTag" class="form-control w-25">`;
        dockerhubRepositories[imageName].tags.forEach(t => body += `<option value="${t}">${t}</option>`);
        body += '</select></div>'
    } else {
        body += `
        <div class="input-form">${imageName}: <select id="imageTag" class="form-control w-25">`;
        repositories[imageName].forEach(t => body += `<option value="${t}">${t}</option>`);
        body += '</select></div>'
    }

    let footer = `
        <button onclick="pullImage('${imageName}', '${source}')" class="btn btn-primary" data-dismiss="modal">Pull</button>
         <button class="btn btn-secondary" data-dismiss="modal">Cancel</button>`;   

    showModal(title, body, footer);
} 

function pullImage(imageRep, source) {
    // rep + tag = imageToPull
    let imageToPull = `${source=='registry'?'localhost:5000/':''}${imageRep}:${$('#imageTag')[0].value}`;

    let reqObj = {
        'type': 'GET',
        'url': `/images/pull?repname=${imageToPull}&source=${source}`,
        'isAsync': true,
        'params': null
    };

    sendRequest(reqObj, 
        (e) => showAlert('Pulling image from dockerhub...', 'info'),
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) { 
                showAlert('An error occurred pulling image! Check console logs.', 'danger');
                console.log('Error while pulling image: ', res['error']);
            }
            else {
                showAlert('Image from dockerhub pulled succesfully!', 'success')
                refreshImageTable();
            }
        },
        (error) => {
            console.log('error: ', error);
            showAlert(`An error occurred, check console.`, 'danger')
        });

}

function loadRegistryRepositories(repositories) {
    let index = 0;
    let table = $('#rep-1-table');
    table.empty();
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
        'url': '/images/registry?source=registry',
        'isAsync': false,
        'params': null
    };

    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) {
                showAlert('An error occurred loading registry! Check console logs.', 'danger');
                console.log('Error loading registry: ', res['error']);
            }
            else {
                repositories = res.repositories;
                loadRegistryRepositories(repositories);
                showAlert('Registry loaded succesfully', 'success');
            } 
        },
        (error) => {
            console.log('error: ', error);
            showAlert(`An error occurred, check console`, 'danger')
        });
}

function searchOnDockerhub(text) {
    let reqObj = {
        'type': 'GET',
        'url': `/images/registry?source=dockerhub&text=${text}`,
        'isAsync': true,
        'params': null
    };

    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) {
                showAlert('An error occurred trying to search on dockerhub! Check console logs.', 'danger');
                console.log('Error trying to search on dockerhub: ', res['error']); 
            }
            else {
                dockerhubRepositories = res.repositories;
                loadDockerhubRepositories(dockerhubRepositories);
                showAlert('Dockerhub results ready!', 'success');
            }
        },
        (error) => {
            console.log(`error:  ${error}`);
            showAlert('An error occurred, check console.', 'danger')
        });    
    showAlert('Loading dockerhub repositories...', 'info')
}
