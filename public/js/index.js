import { login } from './login';

document.addEventListener('DOMContentLoaded', function () {
  console.log(document.getElementById('map'));
});
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log(email, password);
  login(email, password);
});
