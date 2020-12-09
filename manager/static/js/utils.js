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

// validateOpt is an object containing options on how to validate the field
// for example, if is an email, only _,@ and . are valid characters, the object could be
// validateOpt = { 'allow': [ NUMBERS, LETTERS, '@', '.', '_'], 'deny': [ ' ' ]}
function isValidInput(event, validateOpt, onValid) {
    // USE TO VALIDATE --> res = arr1.filter(el => !arr2.includes(el));
    let target = event.target;
    let value = target.value;
    if(validateOpt == 'isempty') {
        if(value == '') {
            target.classList.add('is-invalid');
            target.classList.remove('is-valid');
            if(onInvalid) onInvalid();
        } else {
            target.classList.remove('is-invalid');
            target.classList.add('is-valid');
            if(onValid) onValid();
        }
    }
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
