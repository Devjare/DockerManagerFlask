
function saveNewUsername(event) {
    if(event && event.keyCode != 13) return;

    let newUsername = $('#newUsername').val();
    if(!newUsername) {
        showAlert('Cannot save empty username!', 'warning');
        return;
    }

    let params = { 'newUsername': newUsername };

    let reqObj = {
        'type': 'POST',
        'url': `/settings/newusername`,
        'isAsync': true,
        'params': JSON.stringify(params),
        'requestHeaders': { 
            'Content-Type': 'application/json'
        }
    };

    sendRequest(reqObj, null,
        (response) => {
            console.log('response: ', response);
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert(`Error trying to udpate username: ${res['error']}.`, 'danger');
            else {
                showAlert(`Username updated successfully!`, 'success');
                localStorage['username'] = newUsername;
                location.reload();
            }
        },
        (error) => { 
            showAlert(`An error occurred, check console.`, 'danger');
            console.log('error: ', error);
        });

    showAlert('Updating username...', 'info');
}

function saveNewPassword(event) {
    if(event && event.keyCode != 13) return;
    
    let currentPassword = $('#currentPassword').val();
    let newPassword = $('#newPassword').val(); 
      
    if(!currentPassword || !newPassword) {
        showAlert('Cannot save if password fields are empy!', 'warning');
        return;
    }

    let params = { 
        'currentPassword': currentPassword, 
        'newPassword': newPassword 
    };

    let reqObj = {
        'type': 'POST',
        'url': `/settings/newpassword`,
        'isAsync': true,
        'params': JSON.stringify(params),
        'requestHeaders': { 
            'Content-Type': 'application/json'
        }
    };

    sendRequest(reqObj, null,
        (response) => {
            console.log('response: ', response);
            let res = JSON.parse(response.srcElement.response);
            if('error' in res) showAlert(`Error trying to udpate password: ${res['error']}.`, 'danger');
            else {
                showAlert(`Password updated successfully!`, 'success');
                location.reload();
            }
        },
        (error) => { 
            showAlert(`An error occurred, check console.`, 'danger');
            console.log('error: ', error);
        });
    
    showAlert('Updating password...', 'info');
}

$('main').ready(() => {});
