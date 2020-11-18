var xhr = new XMLHttpRequest();

$('.site-content').ready((e) => {
    console.log('loading images');
    loadAllImages();
    loadRegistry();
});

var images = [];

function loadAllImages() {
    console.log('inside loadAllImages() method');
    xhr.open('GET', `http://localhost:8000/images/json?all=True`, false);
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                console.log('loading all images: ', xhr.responseText);
                images = JSON.parse(xhr.responseText).images;
                loadImages(JSON.parse(xhr.responseText).images);
            }
            else
                dump("Error procesing petition.");

        }
    };
    xhr.send(null);
}

function loadImages(imagesArr) {
    let index = 0;
    imagesArr.forEach(image => {
        template = buildImageTableTemplate(index, image);
        $('#images-table').append(template);
        index++;
    });
}

// function to validate format of various input texts
function validateField(field) {
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
            console.log('images: ', images);
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
    
        let createAndRun = $('#chkRun')[0].checked;

        let data = {
            'image': $('#selectTag')[0].value.toString(),
            'name': $('#containername')[0].value.toString(),
            'ports': $('#ports')[0].value.toString(),
            'command': $('#command')[0].value.toString(),
            'tty': $('#chkTty')[0].checked,
            'run': createAndRun
        };

        if(createAndRun) {
            xhr.open('POST', '/containers/create', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = (e) => {
                if(xhr.readyState == 4) {
                    if(xhr.status == 200) {
                        console.log('container created: ', xhr.responseText);
                        $('#modal').modal('hide');
                    }
                    else dump("Error procesing petition.");
                }
            };
            xhr.send(JSON.stringify(data));
        } else {
            xhr.open('POST', '/containers/create', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = (e) => {
                if(xhr.readyState == 4) {
                    if(xhr.status == 200) {
                        console.log('container created: ', xhr.responseText);
                        $('#modal').modal('hide');
                    }
                    else dump("Error procesing petition.");
                }
            };
            xhr.send(JSON.stringify(data));
        }

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
        <th class="col-s-1" scope="row">${index}</td>
        <td class="col-5 text-truncate">${image['Id']}</td>
        <td class="col-3 text-truncate">${tagsStr}</td>
        <td class="col-1">${created}</td>
        <td class="col-1">${sizeOnMb} MB</td>
        <td class="col-3">
        <a onclick="showImageModal('${image["Id"]}', 'tag_image')">Tag Image</a> |
        <a onclick="showImageModal('${image["Id"]}', 'create_container')" href="#">Create Container</a> |
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

function showPullImageModal(source) {
    if(source == 'dockerhub') {
    } else {
        // from registry
        
    }
}

function pullImage() {
    
}

function loadRegistryRepositories(repositories) {
    console.log('repositories: ', repositories);
    let index = 0;
    let table = $('#rep-1-table');
    // TODO: ADD POPOVER THAT SAYS "Quick pull, pulls the latest tag of that image, instead 
    // of opening a modal to select a tag" TO QUICK PULL ANCHOR TAG
    for(let rep in repositories) {
        let template = `
        <tr class="d-flex">
            <td class="col-s-1">${index}</td>
            <td class="col-5">${rep}</td>
            <td class="col-5">${repositories[rep].toString()}</td>
            <td class="col-2 d-flex justify-content-center">
                <ul>
                    <li><a href="#" onclick="pullImage('${rep}', 'latest', 'registry')">Pull 'latest'</a></li>
                    <!-- <li><a href="#" onclick="showPullImageModal('registry')">pull</a></li> -->
                </ul>
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
                <ul>
                    <!-- 
                    <li><a href="#" onclick="pullImage('${repName}', 'latest', 'registry')">Pull 'latest'</a></li>
                    <li><a href="#" onclick="showPullImageModal('registry')">Pull</a></li> -->
                </ul>
                </td>
        </tr>`;

        table.append(template);
        index++;
        
    }
}

function loadRegistry() {
    xhr.open('GET', 'http://localhost:8000/registry?source=registry', false);
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                loadRegistryRepositories(JSON.parse(xhr.responseText).repositories);
            }
            else dump("Error procesing petition.");
        }
    };
    xhr.send(null);
}

function searchOnDockerhub(text) {
    xhr.open('GET', `http://localhost:8000/registry?source=dockerhub&text=${text}`, true);
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                console.log('found on dockerhub: ', xhr.responseText)
                loadDockerhubRepositories(JSON.parse(xhr.responseText).repositories);
            }
            else dump("Error procesing petition.");
        }
    };
    xhr.send(null);

}
