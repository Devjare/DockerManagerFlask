$('#itemContainers').click((e) => {
    $('.containers-item-submenu').toggle();
});

$('#itemImages').click((e) => {
    $('.images-item-submenu').toggle();
});

function logout() {
    let reqObj = {
        'type': 'GET',
        'url': `http://localhost:8000/logout`,
        'isAsync': false,
        'params': null
    };
    sendRequest(reqObj, 
        (response) => { 
            console.log('successfully logged out!');
            window.location.href = '/';
        },
        (error) => {
            console.log('failed to logout: ', error);
            showAlert('Failed to logout...', 'danger')
        });
}
