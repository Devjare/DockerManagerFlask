let dictionaries = {
    'containerLimits': {},
    'buildargs': {},
    'extraHosts': {}
};

let lists = {
    'cacheFrom': []
};

function showDictModal(dictname) {
    let data = dictionaries[dictname];
    showDictionaryModal(data, dictname);
}

function showLModal(listname) {
    let data = lists[listname];
    showListModal(data, listname);
}

$('#btnToggleFile').click((e) => {
    $('#file-tab')[0].classList.remove('d-none');
    $('#path-tab')[0].classList.add('d-none');

    $('#btnToggleFile')[0].classList.add('btn-primary');
    $('#btnToggleFile')[0].classList.remove('bg-light');

    $('#btnTogglePath')[0].classList.remove('btn-primary');
    $('#btnTogglePath')[0].classList.add('bg-light');
});

$('#btnTogglePath').click((e) => {
    $('#file-tab')[0].classList.add('d-none');
    $('#path-tab')[0].classList.remove('d-none');

    $('#btnTogglePath')[0].classList.add('btn-primary');
    $('#btnTogglePath')[0].classList.remove('bg-light');

    $('#btnToggleFile')[0].classList.remove('btn-primary');
    $('#btnToggleFile')[0].classList.add('bg-light');

});

$('#chkCustomContext').change(() => {
    $('#customContext')[0].classList.toggle('d-none');
});

$('#btnSubmit').click((e) => {
    if($('#fileInput')[0].files.length == 0) {
        e.preventDefault();
        showAlert('A file must be provided, a tarball containing the files which to create the image with.', 'danger');
    }
});


// Commit params
// Hostname 	
// Domainname 	
// User 	
// ExposedPorts
// Env 	
// Cmd 	
// Healthcheck
// HealthConfig
// Image 	
// Volumes
// WorkingDir 	
// Entrypoint 	
// MacAddress 	
// OnBuild 	
// Labels
// StopSignal 	
// StopTimeout 	
// Shell 
// AttachStdin 	
// AttachStdout 	
// AttachStderr 	
// Tty 	
// OpenStdin 	
// StdinOnce 	
// ArgsEscaped 	
// NetworkDisabled 	
