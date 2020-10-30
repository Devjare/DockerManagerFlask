
// -------------        SIGNIN/SIGNUP PAGE BEHAVIOURS        ---------------

loginFormTemplate = `<form action="/login" method="POST">
<h1 class="h3 mb-3 font-weight-normal">Log in Please</h1>
<label class="sr-only" for="inputEmail">Email address</label>
<input name="username" id="inputEmail" class="form-control m-1" type="text" placeholder="Username">
<label class="sr-only" for="inputPassword">Password</label>
<input name="password" id="inputPassword" class="form-control m-1" type="password" placeholder="Password">
<div class="p-2 m-3"><button class="btn btn-lg btn-primary btn-block m-1" type="submit">Log in</button>
<div class="checkbox mb-3 d-flex justify-content-center">
<small><a onclick="switchForm('signup')" href="#">Don't have an account?, sign up here!</a></small>
</div></div></form>`;

registerFormTemplate = `<form action="/signup" method="POST">
<h1 class="h3 mb-3 font-weight-normal">Log in Please</h1>
<label class="sr-only" for="inputEmail">Email address</label>
<input name="username" id="inputEmail" class="form-control m-1" type="text" placeholder="Username">
<label class="sr-only" for="inputPassword">Password</label>
<input name="password" id="inputPassword" class="form-control m-1" type="password" placeholder="Password">
<label class="sr-only" for="inputConfirmPassword">Password</label>
<input name="confirmpassword" id="inputConfirmPassword" class="form-control m-1" type="password" placeholder="Confirm Password">
<div class="p-2 m-3"><button class="btn btn-lg btn-primary btn-block m-1" type="submit">Register</button>
<div class="checkbox mb-3 d-flex justify-content-center">
<small><a onclick="switchForm('signin')" href="#">Already have an account?, Sign in here!</a></small>
</div></div></form>`;

function switchForm(to) {
    document.getElementById('form-type').innerHTML = to == "signup" ? registerFormTemplate : loginFormTemplate;
} 

// TODO: CONFIRM THAT THE PASSWORD IS THE SAME WHEN USING SIGN UP FORM
// TODO: PUT ERROR COLORS WHEN NOT PASSWORD/USERNAME GIVEN
