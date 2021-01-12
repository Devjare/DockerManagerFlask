// containerData has the separated data from the result of docker inspect.
var imageData = {
    'basics': {},
    'containerconfig': {},
    'config': {},
    'graphdriver': {},
    'general': {
        'id': '',
        'container': '',
        'createdAt': '',
    }
};

function loadImageInfo(image) {
    console.log('loading image: ', image);
    let reqObj = {
        'type': 'GET',
        'url': `/images/inspect?id=${image.split(',')[0]}`,
        'isAsync': true,
        'params': null
    };
    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert('An error occurred loading image info!', 'danger');
            else {
                console.log('image info raw: ', res.image);
                imageInfo = res.image;

                imageData.hostconfig = imageInfo.ContainerConfig;
                delete imageInfo.ContainerConfig;

                imageData.config = imageInfo.Config;
                delete imageInfo.Config;

                imageData.graphdriver = imageInfo.GraphDriver;
                delete imageInfo.GraphDriver;

                imageData.basics = imageInfo;

                imageData.general.id = imageInfo.Id;
                imageData.general.container = imageInfo.Container;
                imageData.general.createdAt = imageInfo.Created;

                $('#containerId').text(imageData.general.container);
                $('#imageId').text(imageData.general.id);
                $('#createdAt').text(imageData.general.createdAt);

                fillTableWithJSON('basics-table', imageData.basics);
                fillTableWithJSON('containerconfig-table', imageData.hostconfig);
                fillTableWithJSON('config-table', imageData.config);
                fillTableWithJSON('graphdriver-table', imageData.graphdriver);

                showAlert('Image info loaded succesfully', 'success');
            }
        },
        (error) => {
            console.log('error: ', error);
            showAlert(`An error occurred, check console.`, 'danger');
        });
}

$('main').ready((e) => {
    image = '';
    console.log('localStorage: ', localStorage);
    if(localStorage['images_list']) {
        let imagesNames = localStorage['images_list'].split(',')
        imagesNames.forEach(name => $('#selectImage').append(new Option(name, name)));
    } else {
        // make a request to flask server and get only images names
        let reqObj = {
            'type': 'GET',
            'url': `/images/json`,
            'isAsync': false,
            'params': null
        };
        sendRequest(reqObj, null,
            (response) => {
                console.log('response: ', response);
                let res = JSON.parse(response.srcElement.response);
                if('error' in res) showAlert('An error ocurred obtaining images, check server logs.', 'danger');
                else {
                    showAlert('Images obtained successfully!', 'success');
                    console.log('images/json response: ', res);
                    images = res['images'];
                    images.forEach(i => { 
                        name = i.RepoTags.toString();
                        $('#selectImage').append(new Option(name, name))
                    });
                }
            },
            (error) => {
                console.log('error: ', error);
                showAlert('An error occurred trying to make a request, check console for more info.', 'danger');
            });
    }
    if(localStorage['image']) {
        console.log('local storage: ', localStorage);
        image = localStorage.getItem('image');
        $('#selectImage').val(image.split(',')[0]);
    } else {
        // selects the default image on select input
        image = $('#selectImage')[0].value;
    }
    loadImageInfo(image);
    console.log('main is ready!');

    $('#selectImage').on('change', (e) => {
        loadImageInfo($('#selectImage')[0].value);
    });
});
