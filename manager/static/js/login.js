
var xhr = new XMLHttpRequest();
// -------------        SIGNIN/SIGNUP PAGE BEHAVIOURS        ---------------


loginFormTemplate = `<form action="/login" method="POST">
<h1 class="h3 mb-3 font-weight-normal d-flex justify-content-center">Log in Please</h1>
<input name="username" id="username" class="form-control m-1" type="text" placeholder="Username" onchange="validateField('username')">
<input name="password" id="password" class="form-control m-1" type="password" placeholder="Password" onchange="validateField('password')>
<div class="p-2 m-3"><button class="btn btn-lg btn-primary btn-block m-1" type="submit">Log in</button>
<div class="checkbox mb-3 d-flex justify-content-center">
<small><a onclick="switchForm('signup')" href="#">Don't have an account?, sign up here!</a></small>
</div></div></form>`;

registerFormTemplate = `<form action="/signup" method="POST">
<h1 class="h3 mb-3 font-weight-normal d-flex justify-content-center">Sign up!</h1>
<input name="username" id="username" class="form-control m-1" type="text" placeholder="Username" onchange="validateField('username')">
<input name="password" id="password" class="form-control m-1" type="password" placeholder="Password" onchange="validateField('password')">
<input name="confirmpassword" id="confirmPassword" class="form-control m-1" type="password" placeholder="Confirm Password" onchange="validateField('confirmPassword')">
<div class="p-2 m-3"><button class="btn btn-lg btn-primary btn-block m-1" type="submit">Register</button>
<div class="checkbox mb-3 d-flex justify-content-center">
<small><a onclick="switchForm('signin')" href="#">Already have an account?, Sign in here!</a></small>
</div></div></form>`;

function switchForm(to) {
    document.getElementById('form-type').innerHTML = to == "signup" ? registerFormTemplate : loginFormTemplate;
} 

function sendRequest(url, pararms) { 
}


function validateField(field) {
    let el = document.getElementById(field);
    if(!validate(el.value)) {
        if(el.classList.contains('is-valid')) {
            el.classList.remove('is-valid');
        } else {
            el.classList.add('is-invalid'); 
        }
    } else {
        if(el.classList.contains('is-invalid')) {
            el.classList.remove('is-invalid');
        } else {
            el.classList.add('is-valid'); 
        }
    }
}

function validate(field) {
    return field.length > 0;
}

function login() { 

    username = document.getElementById('username');
    password = document.getElementById('password');

    if(validate(username) && validate(password)) {
        // if not empty
        xhr.open('POST', `http://localhost:8000/login`, true);
        xhr.onreadystatechange = (e) => {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    console.log('login successfull!')
                    alert('login successfull!')
                    // redirtec to main
                }
                else
                    dump("Error procesing petition");
            }
        };
        xhr.send({ 'username': username, 'pasword': password });
    } else {
        alert(`don't leave empty fields`);
    }

}

function signup() {

}

// TODO: CONFIRM THAT THE PASSWORD IS THE SAME WHEN USING SIGN UP FORM
// TODO: PUT ERROR COLORS WHEN NOT PASSWORD/USERNAME GIVEN
