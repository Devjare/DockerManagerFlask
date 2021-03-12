// Description: Object containing the default messages
// that are shown on login fields when invalid input is
// entered.`
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

// Description: Validates 'str' for the 'type'
// that is specified.
function validateStrFor(str, type) {
    if(str == '') return false
    if(type == 'number') {
        if(isNaN(Number(str))) return false;
    } 
    return true;
}

// alertCount is used mainly to set the margin between alerts
// when displaying on browsers.
// showAlert displays an colored notification with a message.
// The colors that uses are the same as bootstrap: 
// success, danger, warning, primary, etc.
var alertCount = 0;
function showAlert(msg, type) { 
    alertCount++;
    let alertEl = `<div id="alert-${alertCount}" class="alert alert-${type} position-absolute d-flex justify-content-between p-2 w-25" 
    style="z-index: 100!important;top: ${50 * alertCount + 20}px;right: 50px" role="alert">${msg}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span></button></div>`
    $('body').append(alertEl);

    // set timeout to disappear the alert after 5 secs.
    setTimeout(() => {
        $(`.alert#alert-${alertCount}`).alert('close');
        alertCount--;
    }, 5000);
}

// sendRequests encapsulates, some data when using xmlhttprequest,
// mainly to reduce code invoking it every time is needed,
// is the replacement for jquery's ajax request methods.
function sendRequest(reqObj, onProgress, onLoad, onError, onAbort) {
    var xhr = new XMLHttpRequest();
    // set to null to prevent using previous listeners assigned
    if(onProgress) xhr.onprogress = onProgress;
    else xhr.onprogress = null;
    if(onLoad) xhr.onload = onLoad;
    else xhr.onload = null;
    if(onError) xhr.onerror = onError;
    else xhr.onerror = null;
    if(onAbort) xhr.onabort = onAbort;
    else xhr.onabort = null;

    xhr.open(reqObj.type, reqObj.url, reqObj.isAsync);
    if('requestHeaders' in reqObj) {
        for(header in reqObj.requestHeaders) {
            // adding every request header indicated
            xhr.setRequestHeader(header, reqObj.requestHeaders[header]);
        }
    }
    xhr.send(reqObj.params);
}

// As it's name says, this function collapse or expands,
// the cards that have the event asigned.
// The ones shown on the description pages.
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

// Modal templates, they're here because every time they are hidden
// or shown, it's necesary to delete or add them to the DOM Completely,
// in order to make dynamic use of them to show different things.
// ================ MODALS =======================
let modalTemplate = `
 <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-hidden="true">
     <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
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

let confirmationModalTemplate = `
<div class="modal fade" id="modalConfirm" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-dark text-white">
                <h5 class="modal-title">Confirm action</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div id="modalConfirmBody" class="modal-body">
            </div>
            <div class="modal-footer">
                <button id="btnConfirm" class="btn btn-sm btn-primary">Confirm</button>
                <button id="btnCancel" class="btn btn-sm btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
</div>`

// showConfirmationModal, and showModal, both make what their name says,
// the confirmation modal has an greater z-index than the normal modal,
// in case a confirmation modal should be displayed on top of a normal 
// modal.
function showConfirmationModal(msg, onConfirm, onCancel) {
    $('body').append(confirmationModalTemplate);

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
// ================================ END MODALS ====================================


// return null if the passed string is empty.
function valueOrNull(str, type) {
    if(type == 'number') {
        if(isNaN(Number(str))) return null;
        else return Number(str);
    } else {
        return str == '' ? null : str;
    }
}

// check if an object is empty
function isObjectEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) return false;
    }
    return true;
}

// check if an element is an object,
// NOTE: null is also considered an object.
function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}

function isEmptyString(str) {
    return str == '';
}

// If a json needs to be displayed and that json object,
// has objects with their own children on various levels
// e.g:
// {
//   'prop1': '',
//   'prop2': {
//      'prop3': '',
//      'prop4': {
//         'prop5': ''
//       }
//    }
// },
// or has an array of data, this method builds an html 
// table prepared to show those 2 kind of obejcts
// using createTableForJSON and createListForArray methods.
//
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

// returns the complete table html template formatted as
// key - value, recursively calling itself again if needed,
// or createListForArray
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

// simply returns a list html template with the 
// passed array argument.
function createListForArray(array) {
    let list = `<ul>`; 
    array.forEach(el => list += `<li>${el}</li>`);
    list += `</ul>`;
    return list;
}

var data, listData;
function deleteDataRow(event, onDeleteProp) {
    let rowToDelete = event.target.parentNode.closest('tr');
    let propToDelete = rowToDelete.children[0].children[0].value;

    // remove row from table
    rowToDelete.remove();

    // delete property from dictionary 'data'
    if(propToDelete in data) delete data[propToDelete];
}

function addNewDataRow() {
    // serch prev new row
    let prevNewRow = $('.empty-row');
    let key = $('.empty-row').find('.key-input').val();
    let value = $('.empty-row').find('.value-input').val();
    // if key is not empty, procceed to remove prev new row and add new empty row.
    if(key != '') {
        // change add button to remove button
        prevNewRow.find('button')[0].onclick = (event) => deleteDataRow(event);
        prevNewRow.find('button')[0].classList.remove('btn-primary');
        prevNewRow.find('button')[0].classList.add('btn-danger');
        prevNewRow.find('button').text('Delete');
        // delete 'empty-row' class from prev new row
        prevNewRow[0].classList.remove('empty-row');
        // add new-row class, for further validation use.
        prevNewRow[0].classList.add('new-row');
        // REVIEW: maybe make the fields read only(?)
        // get prev 'empty-row' data and pass to onAddProp
        $('#tableBody').append(`
        <tr class="empty-row">
            <td><input class="form-control key-input" type="text" placeholder="Data Key"></td>
            <td><input class="form-control value-input" type="text" placeholder="Data Value"></td>
            <td><button class="btn btn-sm btn-primary" onclick="addNewDataRow()">Add</a></td>
        </tr>`); 
        // adds the data to the dictionary 'data'
        if(!(key in data)) data[key] = value;
    } else {
        showAlert('Cannot add an empty key property!', 'danger');
    }
}

// getDynamicDictTemplate() and getDynamicListTemplate()
// are methods to generate an html section to use when a 
// dictionary or a set of key-value pairs is needed as input.
// e.g. when entering container labels, they can be unlimited
// labels(dynamic) and have a key-value format.
// Lists, on the other hand, is similar but when multiple
// strings are needed, for example with container's arguments.
// 
// NOTE: Both examples can be found on the container_creation page.

function getDynamicDictTemplate(dict) {

    data = dict;

    let table = `<table id="tableBody" class="table table-sm"> <thead class="thead-dark">
    <tr><th>Label Key</th><th>Label Value</th><th>Delete</th>
    </tr></thead><tbody id="tableBody">`;
    for(key in dict) {
        table += `
        <tr>
            <td><input class="form-control lkey-input" type="text" value="${key}" disabled></td>
            <td><input class="form-control lvalue-input" type="text" value="${dict[key]}"></td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteDataRow(event)">Delete</a></td>
        </tr>`;
    }
    table += `
    <tr class="empty-row">
        <td><input class="form-control key-input" type="text" placeholder="Data Key"></td>
        <td><input class="form-control value-input" type="text" placeholder="Data Value"></td>
        <td><button class="btn btn-sm btn-primary" onclick="addNewDataRow()">Add</a></td>
    </tr></tbody></table>`; 
    return table; 
}

function addNewListItem() {
    $('#list').append(`
    <li class="new-list-item">
        <input class="form-control list-item-input" type="text" placeholder="Item data">
    </li>`); 
}

function deleteListItem(event, value) {
    let index = listData.indexOf(value);
    let liToDelete = event.target.parentNode;

    if(index < listData.length) {
        listData.splice(index, 1);
        liToDelete.remove();
    } else showAlert(`Index not on limits of array`);
}

function getDynamicListTemplate(list) {
    listData = list;
    let body = `<div class="d-flex flex-column justify-content-center">
        <ul id="list" class="list-group m-2">`

    for(let i = 0;i < list.length;i++) {
        body += 
            `<li id="${i}" class="list-group-item d-flex justify-content-between align-items-center">
        ${list[i]}
        <span class="icon" onclick="deleteListItem(event, '${list[i]}')" data-feather="trash"></span>
    </li>`
    }
    body += `</ul>
    <button class="btn btn-sm btn-primary align-self-end" onclick="addNewListItem()">new</button></div>`;

    return body;
}

function addNewItemToList() {
    let newItemData = $('.new-list-item').find('.list-item-input');
    newItemData.each(index => {
        let value = newItemData[index].value;
        if(value) listData.push(value);
    });
}

function showListModal(list, listName) {
    listData = list;

    let title = `Manage ${listName} data.`;

    let body = getDynamicListTemplate(listData);

    let footer = `<div class="d-flex justify-content-end">
    <button class="btn btn-sm btn-secondary mx-1" data-dismiss="modal">Close</button>
    </div>`;

    showModal(title, body, footer, 
        (e) => {
            // onHide modal
            e.preventDefault();
            e.stopImmediatePropagation();

            // send modal to back to show the confirmation above all;
            let inputsToValidate = $('.new-list-item');
            if(inputsToValidate.length > 0) {
                if(validateInputs($('#modal input')) == false) {
                    showConfirmationModal(
                        `Are you sure to leave with blank fields?, if a key field is blank, it wont be added.`, 
                        (e) => { 
                            addNewItemToList();
                            updateListDisplay(listName);
                            hideConfirmationModal();
                            hideModal();
                        }, 
                        (e) => hideConfirmationModal());
                } else {
                    addNewItemToList();
                    updateListDisplay(listName);
                    hideModal();
                }
            } else {
                updateListDisplay(listName);
                hideModal();
            }

            return false;
        }, null,
        (e) => {
            // on modal show load delete icon.
            feather.replace();
        }
    );

}

function validateInputs(inputs) {
    for(key in inputs) 
        if(inputs[key].value == '') 
            return false;
    return true;
}

function updateDictionaryDisplay(dictName) {
    $(`#${dictName}`)[0].value = JSON.stringify(data);
}

function updateListDisplay(listName) {
    $(`#${listName}`)[0].value = listData.toString();}

// shows a modal with a generated html table for json
// inputs.
function showDictionaryModal(dict, dictName) {
    let title = `Mananage ${dictName} data`;

    let body = `<div class="d-flex flex-column">`;
    body += getDynamicDictTemplate(dict);

    let footer = `<div class="d-flex justify-content-end">
    <button class="btn btn-sm btn-secondary mx-1" data-dismiss="modal">Close</button>
    </div>`;

    showModal(title, body, footer,
        (e) => {
            // onHide modal
            e.preventDefault();
            e.stopImmediatePropagation();

            // send modal to back to show the confirmation above all;
            let inputsToValidate = $('.new-row');
            if(inputsToValidate.length > 0) {
                if(validateInputs($('#modal input')) == false) {
                    showConfirmationModal(
                        `Are you sure to leave with blank fields?, if a value is blank, the key will be added with no value.`, 
                        (e) => { 
                            updateDictionaryDisplay(dictName);
                            hideConfirmationModal();
                            hideModal();
                        }, 
                        (e) => hideConfirmationModal());
                } else {
                    updateDictionaryDisplay(dictName);
                    hideModal();
                }
            } else {
                updateDictionaryDisplay(dictName);
                hideModal();
            }

            return false;
        });
}
