// containerData has the separated data from the result of docker inspect.
var containerData;
function loadContainerInfo(container) {
    console.log('loading container info for: ', container);
    let reqObj = {
        'type': 'GET',
        'url': `/containers/inspect/${container}`,
        'isAsync': true,
        'params': null
    };
    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert('An error occurred loading images!', 'danger');
            else {
                containerInfo = res.container;
                hostConfig = containerInfo.HostConfig;
                config = containerInfo.Config;
                graphDriver = containerInfo.GraphDriver;
                networkSettings = containerInfo.NetworkSettings;

                delete containerInfo.HostConfig;
                delete containerInfo.Config;
                delete containerInfo.GraphDriver;
                delete containerInfo.NetworkSettings;

                console.log('container info: ', containerInfo);
                console.log('Host Config: ', hostConfig);
                console.log('Config: ', config);
                console.log('Graph Driver: ', graphDriver);
                console.log('Network Settings: ', networkSettings);

                fillTableWithJSON('basics-table', containerInfo);

                showAlert('Container info loaded succesfully', 'success');
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
        let reqObj = {
            'type': 'GET',
            'url': `/containers/json`,
            'isAsync': true,
            'params': null
        };
        sendRequest(reqObj, null,
            (response) => {
                let res = JSON.parse(response.srcElement.response);
                if('error' in res) showAlert('An error ocurred obtaining containers, check server logs.', 'danger');
                else {
                    showAlert('Containers obtained successfully!, refreshing list!', 'success');
                    console.log('containers/json response: ', res);
                    containers = res['containers'];
                    containers.forEach(c => { 
                        name = c.Names[0];
                        $('#selectContainer').append(new Option(name, name))
                    });
                }
            },
            (error) => {
                console.log('error: ', error);
                showAlert('An error occurred trying to make a request, check console for more info.', 'danger');
            });
    }
    if(localStorage['container']) {
        console.log('local storage: ', localStorage);
        container = localStorage.getItem('container');
        $('#selectContainer').val(container);
    } else {
        // selects the default container on select input
        container = $('#selectContainer')[0].value;
    }
    loadContainerInfo(container)
    console.log('main is ready!');
    let enableableTemplate = `
    <li id="tty" class="list-group-item d-flex justify-content-between">
        Testo
        <span data-feather="check"></span>
    </li>`;
});
