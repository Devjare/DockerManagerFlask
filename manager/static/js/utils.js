function portsArrayToString(portsArray) {
    str = "";
    portsArray.forEach(port => { 
        str += JSON.stringify(port) + ", ";
    });
    return str;
}

// Convert from unix timestamp to normal date format
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

// collapse cards
function collapseCards(elementId, collapse) {
   if(collapse) {
       // collapse 
   } else {
       // expand
   }
}

function showAlert(msg, type) { 
    let alertEl = `<div class="alert alert-${type} position-absolute d-flex justify-content-between p-2 w-25" 
    style="z-index: 100!important;top: 80px;right: 50px" role="alert">${msg}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span></button></div>`
    $('body').append(alertEl);
    setTimeout(() => {
        $('.alert').alert('close');
    }, 5000);
}

// GLOBAL XHR OBJECT
var xhr = new XMLHttpRequest();
function sendRequest(reqObj, onSuccess, onError) {
    xhr.open(reqObj.type, reqObj.url, reqObj.isAsync);
    if('requestHeaders' in reqObj) {
        for(header in reqObj.requestHeaders) {
            // adding every requet header indicated
            xhr.setRequestHeader(header, reqObj.requestHeaders[header]);
        }
    }
    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4) onSuccess(xhr.responseText);
        else onError(xhr.responseText);
    }
    xhr.send(reqObj.params);
}
