
var xhr = new XMLHttpRequest();

loginFormTemplate = `<div>
<h1 class="h3 mb-3 font-weight-normal d-flex justify-content-center">Log in Please</h1>
<input name="username" id="username" class="form-control m-1" type="text" placeholder="Username" pattern="\\w+$" oninput="setCustomValidity('')">
<input name="password" id="password" class="form-control m-1" type="password" placeholder="Password" pattern="[^\\s\\\\]+$" oninput="setCustomValidity('')">
<div class="p-2 m-3"><button onclick="login()" class="btn btn-lg btn-primary btn-block m-1">Log in</button>
<div class="checkbox mb-3 d-flex justify-content-center">
<small><a onclick="switchForm('signup')" href="#">Don't have an account?, sign up here!</a></small>
</div></div></div>`;

registerFormTemplate = `<div>
<h1 class="h3 mb-3 font-weight-normal d-flex justify-content-center">Sign up!</h1>
<input name="username" id="username" class="form-control m-1" type="text" placeholder="Username" pattern="\\w+$" oninput="setCustomValidity('')">
<input name="password" id="password" class="form-control m-1" type="password" placeholder="Password" placeholder="Password" pattern="[^\\s\\\\]+$" oninput="setCustomValidity('')">
<input name="confirmpassword" id="confirmPassword" class="form-control m-1" type="password" placeholder="Confirm Password" placeholder="Password" pattern="[^\\s\\\\]+$" oninput="setCustomValidity('')">
<div class="p-2 m-3"><button class="btn btn-lg btn-primary btn-block m-1">Register</button>
<div class="checkbox mb-3 d-flex justify-content-center">
<small><a onclick="switchForm('signin')" href="#">Already have an account?, Sign in here!</a></small>
</div></div></div>`;

function switchForm(to) {
    document.getElementById('form-type').innerHTML = to == "signup" ? registerFormTemplate : loginFormTemplate;
    setValidities();
} 

function validate(field) {
    return field.length > 0;
}

function invalidSignupParamsExists() {
    if(!document.getElementById('username').checkValidity()) {
        document.getElementById('username').setCustomValidity(fieldsMessages['username']);
        document.getElementById('username').reportValidity();
        return true;
    }
    if(!document.getElementById('password').checkValidity()) {
        document.getElementById('password').setCustomValidity(fieldsMessages['password']);
        document.getElementById('password').reportValidity();
        return true;
    }
    if(!document.getElementById('confirmPassword').checkValidity()) {
        document.getElementById('confirmpassword').setCustomValidity(fieldsMessages['confirmPassword']);
        document.getElementById('confirmpassword').reportValidity();
        return true;
    }
    return false;
}
function invalidLoginParamsExists() {
    if(!document.getElementById('username').checkValidity()) {
        document.getElementById('username').setCustomValidity(fieldsMessages[key]);
        document.getElementById('username').reportValidity();
        return true;
    }
    if(!document.getElementById('password').checkValidity()) {
        document.getElementById('password').setCustomValidity(fieldsMessages[key]);
        document.getElementById('password').reportValidity();
        return true;
    }
    return false;
}

function login() { 

    if(invalidLoginParamsExists()) {
        showAlert('invalid params, check red marked fields!', 'danger');
        return;
    }

    username = $('#username')[0].value;
    password = $('#password')[0].value;

    console.log('logging in with: ');
    console.log(`username: ${username}, password: ${password}`);
    if(validate(username) && validate(password)) {
        params = {
            'username': username,
            'password': password
        };
        let reqObj = {
            'type': 'POST',
            'url': '/login',
            'isAsync': false,
            'params': JSON.stringify(params),
            'requestHeaders': { 'Content-Type': 'application/json' }
        };

        sendRequest(reqObj, 
            (e) => console.log('loading request...'),
            (response) => {
                let res = JSON.parse(response.srcElement.response);
                if('error' in res) { 
                    location.href = '/';
                    showAlert(`Failed to log in, error: ${res['error']}`, 'danger');
                }
                else {
                    showAlert('login successfull!', 'success');
                    location.href = '/home';
                }
            }, 
            (error) => {
                showAlert('Container failed to create', 'danger');
                console.log('error for container creation: ', error);
            });
    } else {
        showAlert(`Don't leave empty fields`, 'danger');
    }

}

function signup() {

}

$('form').ready((e) => { 
    // check if the invalidity popup should show after the
    // content of an input changed
    setValidities();
});

function setValidities() { 
    $('input:not([readonly])').on('change', (e) => {
        console.log('changed: ', e);
        let id = e.target.id;
        if(!document.getElementById(id).checkValidity()) {
            document.getElementById(id).setCustomValidity(fieldsMessages[id]);
            document.getElementById(id).reportValidity();
        }
    });
}

// TODO: CONFIRM THAT THE PASSWORD IS THE SAME WHEN USING SIGN UP FORM
// TODO: PUT ERROR COLORS WHEN NOT PASSWORD/USERNAME GIVEN
