function loadContainerInfo() {
    let reqObj = {
        'type': 'GET',
        'url': `/containers/inspect/`,
        'isAsync': false,
        'params': null
    };
    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert('An error occurred loading images!', 'danger');
            else {
                images = res.images;
                loadImages(images);
                feather.replace();
                showAlert('Images loaded succesfully', 'success');
            }
        },
        (error) => { 
            console.log('error: ', error);
            showAlert(`An error occurred, check console.`, 'danger');
        });
}

$('main').ready((e) => {
    container = '';
    console.log('localStorage: ', localStorage);
    if(localStorage['containers_list']) {
        let containersNames = localStorage['containers_list'].split(',')
        console.log('names: ', containersNames);
        containersNames.forEach(name => $('#selectContainer').append(new Option(name, name)));
    } else {
        // make a request to flask server and get only containers names
    }
    if(localStorage['container']) {
        console.log('local storage: ', localStorage);
        container = localStorage.getItem('container');
        $('#selectContainer').val(container);
    } else {
        // selects the default container on select input
        container = $('#selectContainer')[0].value;
    }
    console.log('main is ready!');
let enableableTemplate = `
    <li id="tty" class="list-group-item d-flex justify-content-between">
        Testo
        <span data-feather="check"></span>
    </li>`;
});
