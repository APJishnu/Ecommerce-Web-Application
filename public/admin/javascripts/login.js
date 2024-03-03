function showPwd(id1, id2, el) {
  let x = document.getElementById(id1);
  let y = document.getElementById(id2);
  if (x.type === "password" && y.type === "password") {
    x.type = "text";
    y.type = "text";
    el.className = 'fa fa-eye-slash showpwd';
  } else {
    x.type = "password";
    y.type = "password";
    el.className = 'fa fa-eye showpwd';
  }
}

function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
}

// password eye
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('show_eye');
const hidePassword = document.getElementById('hide_eye');

togglePassword.addEventListener('click', function () {
  passwordInput.type = 'text';
  togglePassword.classList.add('d-none');
  hidePassword.classList.remove('d-none');
});

hidePassword.addEventListener('click', function () {
  passwordInput.type = 'password';
  hidePassword.classList.add('d-none');
  togglePassword.classList.remove('d-none');
});
