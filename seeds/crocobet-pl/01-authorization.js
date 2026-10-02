window.TEST_DATA.suites.push({
  id: 'authorization',
  name: 'Authorization',
  nameKa: 'ავტორიზაცია',
  icon: 'lock',
  summary: 'Login, registration and session handling for the Polish app.',
  groups: [
    {
      id: 'login',
      name: 'Login',
      file: 'tests/authorization/login_test.dart',
      precondition: 'The app is installed and launched; the user is on the Login screen.',
      cases: [
        {
          ref: 'PL-1',
          title: 'Successful login with valid credentials',
          tags: ['FAV-SMOKE', 'login-feat'],
          steps: [
            { action: 'Enter a valid username and password.', expected: 'The Login button becomes enabled.' },
            { action: 'Tap the Login button.', expected: 'The Home screen is displayed in the authorized state.' }
          ]
        },
        {
          ref: 'PL-2',
          title: 'Login button is disabled while a field is empty',
          tags: ['FAV-SMOKE', 'login-feat'],
          steps: [
            { action: 'Leave the password field empty.', expected: 'The Login button stays disabled.' }
          ]
        }
      ]
    }
  ]
});
