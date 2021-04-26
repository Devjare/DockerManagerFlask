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
    let reqObj = {
        'type': 'GET',
        'url': `/images/inspect?id=${image.split(',')[0]}`,
        'isAsync': true,
        'params': null
    };
    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert(`An error occurred loading image info, error: ${res.error}`, 'danger');
            else {
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
            showAlert(`An error occurred, ${error}.`, 'danger');
        });
}

$('main').ready((e) => {
    image = '';
    if(localStorage['images_list']) {
        let imagesNames = localStorage['images_list'].split(',')
        imagesNames.forEach(name => $('#selectImage').append(new Option(name, name)));
    } else {
        let reqObj = {
            'type': 'GET',
            'url': `/images/json`,
            'isAsync': false,
            'params': null
        };
        sendRequest(reqObj, null,
            (response) => {
                let res = JSON.parse(response.srcElement.response);
                if('error' in res) {
                    showAlert(`An error ocurred obtaining images, ${res.error}.`, 'danger');
                    console.log('error: ', res['error']);
                }
                else {
                    showAlert('Images obtained successfully!', 'success');
                    images = res['images'];
                    images.forEach(i => { 
                        name = i.RepoTags.toString();
                        $('#selectImage').append(new Option(name, name))
                    });
                }
            },
            (error) => {
                console.log('error: ', error);
                showAlert(`An error occurred trying to make a request, error: ${error}.`, 'danger');
            });
    }

    if(localStorage['image']) {
        image = localStorage.getItem('image');
        $('#selectImage').val(image.split(',')[0]);
    } else {
        image = $('#selectImage')[0].value;
    }
    if(image != '') {
        loadImageInfo(image);
    } else showAlert('No images to inspect. Try creating one.', 'warning');

    $('#selectImage').on('change', (e) => {
        loadImageInfo($('#selectImage')[0].value);
    });
});
