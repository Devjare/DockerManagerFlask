function toggleDockerfileUpload(type) {
    if(type == 'file') {
        $('#file-tab')[0].classList.remove('d-none');
        $('#path-tab')[0].classList.add('d-none');

        $('#btnToggleFile')[0].classList.add('btn-primary');
        $('#btnToggleFile')[0].classList.remove('bg-light');
        
        $('#btnTogglePath')[0].classList.remove('btn-primary');
        $('#btnTogglePath')[0].classList.add('bg-light');
    } else {
        $('#file-tab')[0].classList.add('d-none');
        $('#path-tab')[0].classList.remove('d-none');

        $('#btnTogglePath')[0].classList.add('btn-primary');
        $('#btnTogglePath')[0].classList.remove('bg-light');
        
        $('#btnToggleFile')[0].classList.remove('btn-primary');
        $('#btnToggleFile')[0].classList.add('bg-light');
    }

}

$('#chkCustomContext').change(() => {
    $('#customContext')[0].classList.toggle('d-none');
});
