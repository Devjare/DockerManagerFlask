let dictionaries = {
    'volumes': {},
    'labels': {},
    'exposed_ports': {},
    'healthcheck': { },
}

let lists = {
    'entrypoint': [],
    'onbuild': [],
    'cmd': [],
    'env': [],
    'shell': []
}

function showDictModal(dictname) {
    let data = dictionaries[dictname];
    showDictionaryModal(data, dictname);
}

function showLModal(listname) {
    let data = lists[listname];
    showListModal(data, listname);
}

$('main').ready((e) => {
});


// Commit params
// STRINGS
// Hostname 	
// Domainname 	
// User 	
// Image 	
// WorkingDir 	
// MacAddress 	
// StopSignal 	

// INTERGERS
// StopTimeout 	

// DICTIONARY
// ExposedPorts
// Volumes
// Labels
// Healthcheck, properties:
// { 
// "Test": [], ARRAY OF STRING
// "Interval": 0, INTEGER
// "Timeout": 0, INTERGER
// "Retries": 0, INTERGER 
// "StartPeriod": 0 INTEGER
// }


// ARRAY OF STRING
// Shell 
// Cmd 	
// Env 	
// Entrypoint 	
// OnBuild 	

// BOOLEANS
// AttachStdin 	
// AttachStdout 	
// AttachStderr 	
// Tty 	
// OpenStdin 	
// StdinOnce 	
// ArgsEscaped 	
// NetworkDisabled 	
