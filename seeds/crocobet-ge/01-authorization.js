window.TEST_DATA.suites.push({
  id: 'authorization',
  name: 'Authorization',
  nameKa: 'ავტორიზაცია',
  icon: 'lock',
  summary: 'Login with username/password, CAPTCHA validation and login with an SMS code.',
  groups: [
    {
      id: 'login-username-password',
      name: 'Login with username and password',
      file: 'tests/authorization/login_with_username_and_password_test.dart',
      precondition: 'The app is installed and launched; the user is on the Login screen.',
      cases: [
        {
          ref: 'FAV2-13',
          title: 'Successful login with valid username and password',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          steps: [
            { action: 'Open the Login screen and enter a valid username and password.', expected: 'Both fields accept the input and the Login button becomes enabled.' },
            { action: 'Tap the Login button.', expected: 'The easy-auth (biometrics) bottom sheet is displayed.' },
            { action: 'Dismiss the easy-auth bottom sheet.', expected: 'The Home screen is displayed in the authorized state.' }
          ]
        },
        {
          ref: 'FAV2-14',
          title: 'Login button is disabled when the username field is left empty',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          steps: [
            { action: 'Leave the username field empty.', expected: 'The username field is empty.' },
            { action: 'Enter a valid password (SomePassword1@).', expected: 'The password is accepted.' },
            { action: 'Check the Login button state.', expected: 'The Login button stays disabled.' }
          ]
        },
        {
          ref: 'FAV2-15',
          title: 'Login button is disabled when the password field is left empty',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          steps: [
            { action: 'Enter a username (SomeUser).', expected: 'The username is accepted.' },
            { action: 'Clear the password field.', expected: 'The password field is empty.' },
            { action: 'Check the Login button state.', expected: 'The Login button stays disabled.' }
          ]
        },
        {
          ref: 'FAV2-17',
          title: 'Login fails with an incorrect username or password',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          steps: [
            { action: 'Enter a valid username with a wrong password and tap Login.', expected: 'The login request is rejected.' },
            { action: 'Observe the error area.', expected: 'An error is displayed with the text "Invalid username or password".' },
            { action: 'Observe the current screen.', expected: 'The user stays on the Login screen and is not authorized.' }
          ]
        },
        {
          ref: 'FAV2-19',
          title: 'Loading animation appears while credentials are being verified',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          steps: [
            { action: 'Enter valid credentials.', expected: 'The Login button is enabled.' },
            { action: 'Tap Login and inspect the button immediately (without waiting for the request to settle).', expected: 'The Login button shows its loading indicator while the credentials are verified.' }
          ]
        },
        {
          ref: 'FAV2-39',
          title: 'Login button is disabled when the CAPTCHA length is less than 6 digits',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          precondition: 'CAPTCHA has been triggered by repeated failed login attempts.',
          steps: [
            { action: 'Enter 5 digits (12345) in the CAPTCHA field.', expected: 'The Login button stays disabled.' }
          ]
        },
        {
          ref: 'FAV2-40',
          title: 'User should not be able to enter more than 6 digits in CAPTCHA',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          precondition: 'CAPTCHA has been triggered by repeated failed login attempts.',
          steps: [
            { action: 'Type 7 digits (1234567) in the CAPTCHA field.', expected: 'The field does not accept the 7th digit and the Login button is enabled on the 6 digits it kept.' }
          ]
        },
        {
          ref: 'FAV2-44',
          title: 'CAPTCHA field only accepts numeric values',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          precondition: 'CAPTCHA has been triggered by repeated failed login attempts.',
          steps: [
            { action: 'Enter letters (ABCDEF) in the CAPTCHA field.', expected: 'The letters are not accepted and the Login button stays disabled.' },
            { action: 'Enter special characters (@#$%^&).', expected: 'The symbols are not accepted and the Login button stays disabled.' },
            { action: 'Enter 6 digits (123456).', expected: 'The digits are accepted and the Login button becomes enabled.' }
          ]
        },
        {
          ref: 'FAV2-61',
          title: 'Rapid consecutive Login button clicks before the first request completes',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          steps: [
            { action: 'Enter valid credentials.', expected: 'The Login button is enabled.' },
            { action: 'Tap the Login button 5 times in rapid succession.', expected: 'The rapid taps produce a single login flow and the easy-auth bottom sheet is displayed.' }
          ]
        },
        {
          ref: 'FAV2-62',
          title: 'Login with a username containing mixed RTL and LTR characters',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          steps: [
            { action: 'Enter a username mixing Latin and Arabic characters (user123مرحبا) and a valid password, then tap outside the fields.', expected: 'A validation error is displayed with the text "Use only Latin letters".' }
          ]
        },
        {
          ref: 'FAV2-80',
          title: 'CAPTCHA validation with exactly 5 characters entered',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          precondition: 'CAPTCHA has been triggered by repeated failed login attempts.',
          steps: [
            { action: 'Enter exactly 5 digits (12345).', expected: 'The Login button stays disabled (boundary below the required length).' },
            { action: 'Enter 6 digits (123456).', expected: 'The Login button becomes enabled.' }
          ]
        },
        {
          ref: 'FAV2-95',
          title: 'Login button remains disabled after clearing a previously valid CAPTCHA field',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          precondition: 'CAPTCHA has been triggered by repeated failed login attempts.',
          steps: [
            { action: 'Enter a valid 6 digit CAPTCHA (123456).', expected: 'The Login button becomes enabled.' },
            { action: 'Clear the CAPTCHA field.', expected: 'The Login button becomes disabled again.' },
            { action: 'Re-enter a valid 6 digit CAPTCHA.', expected: 'The Login button becomes enabled again.' }
          ]
        },
        {
          ref: 'FAV2-97',
          title: 'Login with a username containing homograph (lookalike Unicode) characters',
          tags: ['FAV-SMOKE', 'login-username-password-feat', 'login-feat'],
          steps: [
            { action: 'Enter a username starting with a Cyrillic "а" (аdmin) and a valid password, then tap outside the fields.', expected: 'A validation error is displayed with the text "Use only Latin letters".' },
            { action: 'Clear the username, enter the Latin equivalent (admin) and tap outside the fields.', expected: 'The error disappears and the Login button becomes enabled.' }
          ]
        }
      ]
    },
    {
      id: 'login-sms-code',
      name: 'Login with SMS code',
      file: 'tests/authorization/login_with_sms_code_test.dart',
      precondition: 'The app is installed and launched; the user is on the Login screen.',
      cases: [
        {
          ref: 'FAV2-101',
          title: 'Login button disabled state when the SMS code field is empty',
          tags: ['FAV-SMOKE', 'login-sms-code-feat', 'login-feat'],
          steps: [
            { action: 'Enter a valid username and switch to "Login with SMS".', expected: 'The SMS code field is displayed and the Login button is disabled while it is empty.' },
            { action: 'Enter any value in the SMS code field (12).', expected: 'The Login button becomes enabled.' }
          ]
        },
        {
          ref: 'FAV2-102',
          title: 'Customer logs in with a valid SMS code',
          tags: ['login-sms-code-feat', 'login-feat'],
          precondition: 'A test account with SMS authentication enabled.',
          steps: [
            { action: 'Enter the SMS-auth username, switch to "Login with SMS" and tap "Get SMS code".', expected: 'The SMS code is requested and sent to the account phone number.' },
            { action: 'Read the code via the API helper and enter it in the SMS code field.', expected: 'The Login button becomes enabled.' },
            { action: 'Tap Login and dismiss the easy-auth sheet.', expected: 'The Home screen is displayed in the authorized state.' }
          ]
        }
      ]
    }
  ]
});
