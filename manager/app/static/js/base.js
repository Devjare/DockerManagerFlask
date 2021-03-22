$('input[type=text]:not([readonly])').on('change', (e) => {
    let id = e.target.id;
    if(!document.getElementById(id).checkValidity()) {
        document.getElementById(id).setCustomValidity(fieldsMessages[id]);
        document.getElementById(id).reportValidity();
    }
});

function logout() {
    let reqObj = {
        'type': 'GET',
        'url': `/logout`,
        'isAsync': false,
        'params': null
    };
    
    sendRequest(reqObj, null, 
        (response) => { 
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) {
                showAlert('An error occurred trying to logout! Check logs.', 'danger');
                console.log('error: ', res['error']);
            }
            else {
                showAlert('Successfully logged out!', 'success');
                window.location.href = '/';
                localStorage.clear();
            }
        },
        (error) => {
            console.log('failed to logout: ', error);
            showAlert('Failed to logout...', 'danger')
        });
}
