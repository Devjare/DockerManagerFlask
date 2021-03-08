// containerData has the separated data from the result of docker inspect.
var containerData = {
    'basics': {},
    'hostconfig': {},
    'config': {},
    'graphdriver': {},
    'networksettings': {},
    'general': {
        'id': '',
        'image': '',
        'status': '',
        'createdAt': '',
        'startedAt': '',
        'finishedAt': ''
    }
};

function loadContainerInfo(container) {
    let reqObj = {
        'type': 'GET',
        'url': `/containers/inspect/${container}`,
        'isAsync': true,
        'params': null
    };
    sendRequest(reqObj, null,
        (response) => {
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) {
                showAlert('An error occurred loading containers!', 'danger');
                console.log('error: ', res['error']);
            }
            else {
                console.log('container info raw: ', res.container);
                containerInfo = res.container;

                containerData.hostconfig = containerInfo.HostConfig;
                delete containerInfo.HostConfig;

                containerData.config = containerInfo.Config;
                delete containerInfo.Config;

                containerData.graphdriver = containerInfo.GraphDriver;
                delete containerInfo.GraphDriver;

                containerData.networksettings = containerInfo.NetworkSettings;
                delete containerInfo.NetworkSettings;

                containerData.basics = containerInfo;

                containerData.general.id = containerInfo.Id;
                containerData.general.image = containerInfo.Image;
                containerData.general.createdAt = containerInfo.Created;
                containerData.general.status = containerInfo.State.Status;
                containerData.general.startedAt = containerInfo.State.StartedAt;
                containerData.general.finishedAt = containerInfo.State.FinishedAt;

                $('#containerId').text(containerData.general.id);
                $('#imageId').text(containerData.general.image);
                $('#createdAt').text(containerData.general.createdAt);
                $('#startedAt').text(containerData.general.startedAt);
                $('#finishedAt').text(containerData.general.finishedAt);

                // remove previous color classess on item
                // remove from background
                $('#status').parent()[0].classList.remove('bg-dark');
                $('#status').parent()[0].classList.remove('bg-light');
                $('#status').parent()[0].classList.remove('bg-success');
                $('#status').parent()[0].classList.remove('bg-danger');
                $('#status').parent()[0].classList.remove('bg-info');
                $('#status').parent()[0].classList.remove('bg-warning');
                $('#status').parent()[0].classList.remove('bg-primary');
                // remove from foreground(text) 
                $('#status')[0].classList.remove('text-white');
                $('#status')[0].classList.remove('text-black');

                let stateBg = 'bg-';
                let stateFg = 'text-white';
                switch(containerData.general.status) {
                    case 'running':
                        stateBg += 'success';
                        stateFg = 'text-white';
                        break;
                    case 'stopped':
                    case 'created':
                        stateBg += 'light';
                        stateFg = 'text-black';
                        break;
                    case 'restarting':
                        stateBg += 'warning';
                        stateFg = 'text-black';
                        break;
                    case 'paused': 
                        stateBg += 'info';
                        stateFg = 'text-white';
                        break;
                    default:
                        stateBg += 'danger';
                        stateFg = 'text-white';
                }
                $('#status').parent()[0].classList.add(stateBg);
                $('#status').text(containerData.general.status); 
                $('#status')[0].classList.add(stateFg);
        
                fillTableWithJSON('basics-table', containerData.basics);
                fillTableWithJSON('hostconfig-table', containerData.hostconfig);
                fillTableWithJSON('config-table', containerData.config);
                fillTableWithJSON('graphdriver-table', containerData.graphdriver);
                fillTableWithJSON('networksettings-table', containerData.networksettings);

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
    if(localStorage['containers_list']) {
        let containersNames = localStorage['containers_list'].split(',')
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
        container = localStorage.getItem('container');
        $('#selectContainer').val(container);
    } else {
        // selects the default container on select input
        container = $('#selectContainer')[0].value;
    }
    loadContainerInfo(container);
    console.log('main is ready!');

    $('#selectContainer').on('change', (e) => {
        loadContainerInfo($('#selectContainer')[0].value);
    });
});
