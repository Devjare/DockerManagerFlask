var loginFieldsMessages = {
    'username': 'Only numbers, letters, _, and - are allowed.',
    'password': 'No Whitespaces',
    'confirmPassword': 'No Whitespaces'
}

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

function validateStrFor(str, type) {
    if(str == '') return false
    if(type == 'number') {
        if(isNaN(Number(str))) return false;
    } 
    return true;
}

var alertCount = 0;
function showAlert(msg, type) { 
    alertCount++;
    let alertEl = `<div id="alert-${alertCount}" class="alert alert-${type} position-absolute d-flex justify-content-between p-2 w-25" 
    style="z-index: 100!important;top: ${40 * alertCount + 20}px;right: 50px" role="alert">${msg}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span></button></div>`
    $('body').append(alertEl);
   
    // set timeout to disappear the alert after 5 secs.
    setTimeout(() => {
        console.log('alert count: ', alertCount);    
        $(`.alert#alert-${alertCount}`).alert('close');
        alertCount--;
    }, 5000);
}

// GLOBAL XHR OBJECT
var xhr = new XMLHttpRequest();
function sendRequest(reqObj, onProgress, onLoad, onError, onAbort) {
    // set to null to prevent using previous listeners assigned
    if(onProgress) xhr.onprogress = onProgress;
    else xhr.onprogress = null;
    if(onLoad) xhr.onload = onLoad;
    else xhr.onload = null;
    if(onError) xhr.onerror = onError;
    else xhr.onerror = null;
    if(onAbort) xhr.onabort = onAbort;
    else xhr.onabort = null;

    console.log('request: ', reqObj);
    xhr.open(reqObj.type, reqObj.url, reqObj.isAsync);
    if('requestHeaders' in reqObj) {
        for(header in reqObj.requestHeaders) {
            // adding every requet header indicated
            xhr.setRequestHeader(header, reqObj.requestHeaders[header]);
        }
    }
    xhr.send(reqObj.params);
}


function collapseCard(event) {
    let target =  event.target;
    let parent = $(target.parentNode);

    if(parent[0].classList.contains('collapsed')) {
        // after expand actions
        target.children[1].style.transform = 'rotate(0deg)';
    } else {
        // after collapse actions 
        target.children[1].style.transform = 'rotate(180deg)';
    }

    parent[0].classList.toggle('collapsed');
    // hide card-body
    parent[0].children[1].classList.toggle('hide');
}

function showConfirmationModal(msg, onConfirm, onCancel) {
    // set the current modal to the back
    $('#modal').css({'z-index': '0'}); 

    $('#modalConfirmBody').text(msg);
    $('#modalConfirm').modal('show');

    $('#modalConfirm').ready((e) => {
        $('#modalConfirm #btnCancel').on('click', (e) => onCancel(e));
        $('#modalConfirm #btnConfirm').on('click', (e) => onConfirm(e));
    });
    
    // when the confirmation hides, show again the modal on front.
    $('#modalConfirm').on('hidden.bs.modal', (e) => {
        $('#modal').css({'z-index': ''});
    });
}

function hideConfirmationModal() {
    $('#modalConfirm').modal('hide');
}

let modalTemplate = `
 <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-hidden="true">
     <div class="modal-dialog modal-dialog-centered" role="document">
         <div class="modal-content">
             <div class="modal-header bg-dark text-white">
                 <h5 id="modalTitle" class="modal-title"></h5>
                 <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                     <span aria-hidden="true" data-dismiss="modal">&times;</span>
                 </button>
             </div>
             <div id="modalBody" class="modal-body">
             </div>
             <div id="modalFooter" class="modal-footer">
             </div>
         </div>
     </div>
 </div>`

function showModal(title, body, footer, onHide, onHidden, onShow, onShown) {
    $('body').append(modalTemplate);

    $('#modalTitle').empty(); 
    $('#modalBody').empty();
    $('#modalFooter').empty();

    if(onHide) $('#modal').on('hide.bs.modal', (e) => onHide(e))
    if(onHidden) $('#modal').on('hidden.bs.modal', (e) => onHidden(e))
    if(onShow) $('#modal').on('show.bs.modal', (e) => onShow(e))
    if(onShown) $('#modal').on('shown.bs.modal', (e) => onShown(e))

    $('#modalTitle').text(title); 
    $('#modalBody').html(body);
    $('#modalFooter').html(footer); 
    $('#modal').modal('show'); 
}

function hideModal() {
    // hide modal removes completely from html the modal
    $('#modal').unbind('hide.bs.modal');
    $('#modal').unbind('hidden.bs.modal');
    $('#modal').modal('hide');
}

// return null if the passed string is empty.
function valueOrNull(str, type) {
    if(type == 'number') {
        if(isNaN(Number(str))) return null;
        else return Number(str);
    } else {
        return str == '' ? null : str;
    }
}

// check if object is empty
function isObjectEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) return false;
    }
    return true;
}
function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}

function isEmptyString(str) {
    return str == '';
}

function fillTableWithJSON(tableid, jsonObject) {
    let table = $(`#${tableid} .table-body`);
    table.empty();
    for(key in jsonObject) {
        let newRow = '<tr class="d-flex">';
        let value = jsonObject[key];
        if(Array.isArray(value)) {
            newRow += 
            `<td class="col-4"><strong>${key}</strong></td>
            <td class="col-8">${createListForArray(value)}</td></tr>`;
        } else if(isObject(value)) {
            newRow += 
            `<td class="col-4"><strong>${key}</strong></td>
            <td class="col-8">${createTableForJSON(value)}</td></tr>`;
        } else {
            newRow += 
            `<td class="col-4"><strong>${key}</strong></td>
            <td class="col-8">${value}</td>
            </tr>`;
        }
        table.append(newRow);
    }
}

function createTableForJSON(obj) {
    let table = `<table class="table"><tbody class="table-body">`; 
    for(key in obj) {
        value = obj[key];
        table += 
        `<tr><td><strong>${key}</strong></td><td>
         ${isObject(value) ? createTableForJSON(value) : (Array.isArray(value) ? createListForArray(value) : value)}
         </td></tr>`;
    }
    table += `</tbody></table>`;
    return table;
}

function createListForArray(array) {
    let list = `<ul>`; 
    array.forEach(el => list += `<li>${el}</li>`);
    list += `</ul>`;
    return list;
}
