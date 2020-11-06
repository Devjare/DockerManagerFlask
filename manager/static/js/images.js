var xhr = new XMLHttpRequest();

$('.site-content').ready((e) => {
    console.log('loading images');
    loadAllImages();
});


function loadAllImages() {
    xhr.open('GET', `http://localhost:8000/images/json?all=True`, true);
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
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
        alert('looking on dockerhub');
    } else {
        alert('looking on private registry');
    }
}

function loadRegistry() {
}

function searchOnDockerhub() {
}
