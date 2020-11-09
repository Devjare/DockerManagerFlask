var xhr = new XMLHttpRequest();

$('.site-content').ready((e) => {
    console.log('loading images');
    loadAllImages();
    loadRegistry();
});


function loadAllImages() {
    console.log('inside loadAllImages() method');
    xhr.open('GET', `http://localhost:8000/images/json?all=True`, false);
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                console.log('loading all images: ', xhr.responseText);
                loadImages(JSON.parse(xhr.responseText).images);
            }
            else
                dump("Error procesing petition.");

        }
    };
    xhr.send(null);
}

function loadImages(images) {
    let index = 0;
    images.forEach(image => {
        console.log('image: ', image);
        template = buildImageTableTemplate(index, image);
        $('#images-table').append(template);
        index++;
    });
}

function buildImageTableTemplate(index, image) {
    let sizeOnMb = Number((image['Size'] / 1000000).toFixed(1));
    let tagsStr = image['RepoTags'].toString();
    let created = timeConverter(image['Created']);
    let template = `
    <tr>
        <td>${index}</td>
        <td>${image['Id']}</td>
        <td>${tagsStr}</td>
        <td>${created}</td>
        <td>${sizeOnMb} MB</td>
        <td><a href="#">Action</a></td>
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

function loadRegistryRepositories(repositories) {
    console.log('repositories: ', repositories);
    let index = 0;
    let table = $('#rep-1-table');
    // TODO: ADD POPOVER THAT SAYS "Quick pull, pulls the latest tag of that image, instead 
    // of opening a modal to select a tag" TO QUICK PULL ANCHOR TAG
    for(let rep in repositories) {
        let template = `
        <tr>
            <td>${index}</td>
            <td>${rep}</td>
            <td>${repositories[rep].toString()}</td>
            <td class="d-flex justify-content-center">
                <ul>
                    <li><a href="#" onclick="pullImage('${rep}', 'latest', 'registry')">Pull 'latest'</a></li>
                    <li><a href="#" onclick="showPullImageModal('registry')">pull</a></li>
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
    // TODO: ADD POPOVER THAT SAYS "Quick pull, pulls the latest tag of that image, instead 
    // of opening a modal to select a tag" TO QUICK PULL ANCHOR TAG
    for(let repName in repositories) {
        console.log('rep: ', repName);
        let template = `
        <tr>
            <td>${index}</td>
            <td>${repositories[repName]['name']}</td>
            <td>${repositories[repName]['description']}</td>
            <td>${repositories[repName]['stars']}</td>
            <td>${repositories[repName]['official']}</td>
            <td>${repositories[repName]['automated']}</td>
            <td class="d-flex justify-content-center">
                <ul>
                    <li><a href="#" onclick="pullImage('${repName}', 'latest', 'registry')">Pull 'latest'</a></li>
                    <li><a href="#" onclick="showPullImageModal('registry')">Pull</a></li>
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
