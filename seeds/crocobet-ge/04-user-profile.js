window.TEST_DATA.suites.push({
  id: 'user-profile',
  name: 'User profile',
  nameKa: 'მომხმარებლის პროფილი',
  icon: 'user',
  summary: 'Personal information, password change, phone number change, language, notification settings, invite a friend, promo code and withdraw.',
  groups: [
    {
      id: 'personal-info',
      name: 'Personal information',
      file: 'tests/user_profile/personal_information_test.dart',
      precondition: 'The user is logged in; Profile > Personal information is open.',
      cases: [
        {
          ref: 'PI-01',
          title: 'Avatar edit button opens the photo sheet with the current avatar selected and the Change button disabled',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Open Profile and then Personal information.', expected: 'The Personal information screen is displayed.' },
            { action: 'Tap the avatar edit button.', expected: 'The photo selection sheet is displayed.' },
            { action: 'Inspect the sheet.', expected: 'The current avatar is selected (the selected index is not negative) and the Change button is disabled.' }
          ]
        },
        {
          ref: 'PI-02',
          title: 'Selecting a different avatar moves the selection and enables the Change button',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Open the photo sheet from Personal information.', expected: 'The photo sheet is displayed with the current avatar selected.' },
            { action: 'Tap the first avatar that is not currently selected.', expected: 'The selection moves to the tapped avatar and the Change button becomes enabled.' }
          ]
        },
        {
          ref: 'PI-03',
          title: 'Reselecting the original avatar disables the Change button again',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Open the photo sheet and tap a different avatar.', expected: 'The Change button becomes enabled.' },
            { action: 'Tap the originally selected avatar again.', expected: 'The selection returns to the original avatar and the Change button becomes disabled.' }
          ]
        },
        {
          ref: 'PI-04',
          title: 'Tapping the already selected avatar keeps the Change button disabled',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Open the photo sheet.', expected: 'The current avatar is selected and the Change button is disabled.' },
            { action: 'Tap the already selected avatar.', expected: 'The selection does not change and the Change button stays disabled.' }
          ]
        },
        {
          ref: 'PI-05',
          title: 'Closing the photo sheet without saving leaves the avatar unchanged',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Note the current profile avatar on Personal information.', expected: 'The current avatar URL is recorded.' },
            { action: 'Open the photo sheet, select a different avatar and close the sheet without saving.', expected: 'The sheet is closed.' },
            { action: 'Inspect the profile avatar.', expected: 'The avatar is unchanged and equals the recorded value.' }
          ]
        },
        {
          ref: 'PI-06',
          title: 'Saving a different avatar closes the sheet and updates the profile picture',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Note the current avatar, open the photo sheet and select a different avatar.', expected: 'The Change button becomes enabled.' },
            { action: 'Tap Change.', expected: 'The "photo changed" notification message is displayed and the sheet is closed.' },
            { action: 'Inspect the profile avatar.', expected: 'The avatar differs from the recorded value, i.e. the new picture is applied.' }
          ]
        },
        {
          ref: 'PI-07',
          title: 'Tapping the account id copies it to the clipboard',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Read the account id (PIN) shown on Personal information.', expected: 'The id value is displayed.' },
            { action: 'Tap the copy button next to the account id.', expected: 'The clipboard holds exactly the displayed account id.' }
          ]
        },
        {
          ref: 'PI-08',
          title: 'Personal details section lists every field with a value',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Open Personal information and inspect the personal details section.', expected: 'First name, Last name, Country, Nationality, Personal number and Birth date are all displayed with their values.' }
          ]
        },
        {
          ref: 'PI-09',
          title: 'Account details section shows the email and the id matches the copyable value',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Inspect the account details section.', expected: 'The Email field is displayed with its value.' },
            { action: 'Inspect the account id.', expected: 'The id value is not empty and matches the copyable value.' }
          ]
        },
        {
          ref: 'PI-10',
          title: 'Password row is masked and the phone number and close account rows are displayed',
          tags: ['FAV-SMOKE', 'personal-info-feat', 'FAILED-TEST'],
          steps: [
            { action: 'Inspect the password row on Personal information.', expected: 'The password row shows the masked placeholder value instead of the real password.' },
            { action: 'Inspect the phone number row.', expected: 'The phone number row is displayed with its label.' },
            { action: 'Inspect the close account row.', expected: 'The "close account" row is displayed with its label.' }
          ]
        }
      ]
    },
    {
      id: 'password-positive',
      name: 'Change password — positive',
      file: 'tests/user_profile/change_password_test.dart',
      precondition: 'The user is logged in; Profile > Personal information > Change password is open.',
      cases: [
        {
          ref: 'PWD-01',
          title: 'Eye button reveals and hides the text in all three password fields',
          tags: ['FAV-SMOKE', 'password-positive-feat', 'password-feat'],
          steps: [
            { action: 'Fill the current, new and repeat password fields.', expected: 'All three fields hold their values obscured.' },
            { action: 'For each field, tap the eye button once.', expected: 'The field text becomes visible.' },
            { action: 'Tap the eye button again.', expected: 'The field text is obscured again.' }
          ]
        },
        {
          ref: 'PWD-02',
          title: 'Valid new password satisfies every rule and enables the Get code button',
          tags: ['FAV-SMOKE', 'password-positive-feat', 'password-feat'],
          steps: [
            { action: 'Enter the current password and a valid new password in both new password fields.', expected: 'The letters, digit, length and username rules are all marked as satisfied and no error is shown.' },
            { action: 'Inspect the buttons.', expected: 'The Get code button is enabled and the Submit button stays disabled until the SMS code is entered.' }
          ]
        },
        {
          ref: 'PWD-03',
          title: 'Six character new password satisfies the length rule on the lower boundary',
          tags: ['FAV-SMOKE', 'password-positive-feat', 'password-feat'],
          steps: [
            { action: 'Enter a 6 character password that satisfies the other rules in both new password fields.', expected: 'The length rule is marked as satisfied and no error is shown.' },
            { action: 'Inspect the Get code button.', expected: 'The Get code button is enabled.' }
          ]
        },
        {
          ref: 'PWD-04',
          title: 'Twenty character new password satisfies the length rule on the upper boundary',
          tags: ['FAV-SMOKE', 'password-positive-feat', 'password-feat'],
          steps: [
            { action: 'Enter a 20 character password that satisfies the other rules in both new password fields.', expected: 'The length rule is marked as satisfied and no error is shown.' },
            { action: 'Inspect the Get code button.', expected: 'The Get code button is enabled.' }
          ]
        },
        {
          ref: 'PWD-05',
          title: 'Close button dismisses the change password sheet and returns to Personal information',
          tags: ['FAV-SMOKE', 'password-positive-feat', 'password-feat'],
          steps: [
            { action: 'Open the change password sheet.', expected: 'The sheet is displayed.' },
            { action: 'Tap the close button.', expected: 'The sheet is dismissed and the Personal information screen is displayed.' }
          ]
        }
      ]
    },
    {
      id: 'password-negative',
      name: 'Change password — negative',
      file: 'tests/user_profile/change_password_negative_test.dart',
      precondition: 'The user is logged in; Profile > Personal information > Change password is open. Rules: letters (upper + lower), at least one digit, 6–20 characters, must not equal the username.',
      cases: [
        {
          ref: 'PWDN-01',
          title: 'New password without an uppercase letter fails the letters rule and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter the current password and a new password without an uppercase letter in both new password fields.', expected: 'The letters rule is shown with its label and marked as not satisfied.' },
            { action: 'Inspect the remaining rules.', expected: 'The digit, length and username rules are marked as satisfied.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-02',
          title: 'New password without a digit fails the digit rule and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter a new password with letters only in both new password fields.', expected: 'The digit rule is shown with its label and marked as not satisfied.' },
            { action: 'Inspect the remaining rules.', expected: 'The letters, length and username rules are marked as satisfied.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-03',
          title: 'New password shorter than six characters fails the length rule and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter a password shorter than 6 characters in both new password fields.', expected: 'The length rule is shown with its label and marked as not satisfied, while the other rules are satisfied.' },
            { action: 'Inspect the field error.', expected: 'The "minimum characters" error text is displayed.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-04',
          title: 'New password equal to the username fails the username rule and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          precondition: 'Logged in with the card test account.',
          steps: [
            { action: 'Enter the current password and the account username as the new password in both fields.', expected: 'The username rule is shown with its label and marked as not satisfied.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-05',
          title: 'New password longer than twenty characters fails the length rule and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter a password longer than 20 characters in both new password fields.', expected: 'The length rule is marked as not satisfied while the other rules are satisfied.' },
            { action: 'Inspect the field error.', expected: 'The "maximum characters" error text is displayed.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-06',
          title: 'New password with only uppercase letters fails the letters rule and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter a new password with uppercase letters and a digit only in both fields.', expected: 'The letters rule is marked as not satisfied (a lowercase letter is required).' },
            { action: 'Inspect the remaining rules.', expected: 'The digit, length and username rules are marked as satisfied.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-07',
          title: 'New password of digits only fails the letters rule and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter a digits-only new password in both fields.', expected: 'The letters rule is marked as not satisfied.' },
            { action: 'Inspect the remaining rules.', expected: 'The digit, length and username rules are marked as satisfied.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-08',
          title: 'Five character new password fails the length rule on the lower boundary',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter a 5 character password that satisfies the other rules in both fields.', expected: 'The length rule is marked as not satisfied while the other rules are satisfied.' },
            { action: 'Inspect the field error.', expected: 'The "minimum characters" error text is displayed.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-09',
          title: 'New password breaking the letters, digit and length rules at once blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter a new password that breaks the letters, digit and length rules simultaneously.', expected: 'All three rules are marked as not satisfied while the username rule stays satisfied.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-10',
          title: 'Empty new password leaves every rule unsatisfied and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Open the change password sheet without entering anything.', expected: 'The letters, digit, length and username rules are all marked as not satisfied.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-11',
          title: 'New password equal to the current password shows an error and blocks submit',
          tags: ['FAV-SMOKE', 'password-negative-feat', 'password-feat'],
          steps: [
            { action: 'Enter the current password in all three password fields.', expected: 'The "new password is the same as the current one" error text is displayed under the new password field.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button are disabled.' }
          ]
        },
        {
          ref: 'PWDN-12',
          title: 'New password equal to a username that satisfies the other rules keeps the Get code button disabled',
          tags: ['FAV-SMOKE', 'FAV-BUG', 'password-negative-feat', 'password-feat'],
          precondition: 'Logged in with the card test account; the new password equals the username but satisfies letters, digit and length.',
          steps: [
            { action: 'Enter the current password and a new password equal to the username with a leading uppercase letter.', expected: 'The username rule is marked as not satisfied while the letters, digit and length rules are satisfied.' },
            { action: 'Inspect the helper text under the new password field.', expected: 'The "password matches the username" helper text is displayed.' },
            { action: 'Inspect the buttons.', expected: 'Both the Get code and the Submit button must stay disabled (known bug: the form is not always blocked).' }
          ]
        }
      ]
    },
    {
      id: 'phone-number',
      name: 'Change phone number',
      file: 'tests/user_profile/change_phone_number_test.dart',
      precondition: 'The user is logged in; Profile > Personal information > phone tile > change number sheet is open.',
      cases: [
        {
          ref: 'PHN-01',
          title: 'Change number sheet opens from the phone tile with all fields and labels',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Open the change number sheet from the phone tile.', expected: 'The sheet is displayed with the personal number, birth year, phone number and SMS code labels, plus the Get code and Change buttons.' },
            { action: 'Inspect the phone number field.', expected: 'The country phone prefix is displayed.' },
            { action: 'Inspect the Change button.', expected: 'The Change button is disabled on an empty form.' }
          ]
        },
        {
          ref: 'PHN-02',
          title: 'Close button dismisses the change number sheet',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Open the change number sheet.', expected: 'The sheet is displayed.' },
            { action: 'Tap the close button.', expected: 'The sheet is closed.' }
          ]
        },
        {
          ref: 'PHN-03',
          title: 'Birth year picker is limited to 1900 and the legal gambling age',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Open the birth year picker.', expected: 'The available years start at 1900 and end at the year that corresponds to the minimum legal age of 18.' },
            { action: 'Select a birth year from the list.', expected: 'The selected year is displayed in the birth year field.' }
          ]
        },
        {
          ref: 'PHN-04',
          title: 'Personal number field accepts letters and symbols',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          precondition: 'Logged in with the Georgian test account.',
          steps: [
            { action: 'Enter a non-digit value in the personal number field.', expected: 'The value is accepted as typed (the field is not restricted to digits).' },
            { action: 'Enter the valid personal number of the account.', expected: 'The field holds the entered personal number.' }
          ]
        },
        {
          ref: 'PHN-05',
          title: 'Phone number field accepts only nine digits and rejects other characters',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Enter non-digit characters in the phone number field.', expected: 'Nothing is accepted and the field stays empty.' },
            { action: 'Enter a 10 digit number.', expected: 'Only the first 9 digits are kept.' }
          ]
        },
        {
          ref: 'PHN-06',
          title: 'Incomplete phone number shows the wrong format error',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Enter a phone number shorter than 9 digits.', expected: 'The "wrong format" error is displayed under the phone number field.' },
            { action: 'Enter a complete valid phone number.', expected: 'The error disappears.' }
          ]
        },
        {
          ref: 'PHN-07',
          title: 'Phone number that does not start with five shows the wrong format error',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Enter a 9 digit phone number that does not start with 5.', expected: 'The "wrong format" error is displayed under the phone number field.' }
          ]
        },
        {
          ref: 'PHN-08',
          title: 'SMS code field and the Get code button stay disabled until the phone number is valid',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Open the sheet with an empty phone number field.', expected: 'The SMS code field and the Get code button are disabled.' },
            { action: 'Enter an incomplete phone number.', expected: 'The SMS code field and the Get code button stay disabled.' },
            { action: 'Enter a complete valid phone number.', expected: 'The SMS code field and the Get code button become enabled.' },
            { action: 'Delete one digit from the phone number.', expected: 'The SMS code field and the Get code button become disabled again.' }
          ]
        },
        {
          ref: 'PHN-09',
          title: 'Requesting the SMS code shows the sent message and starts the resend countdown',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Enter a valid new phone number.', expected: 'The Get code button is enabled.' },
            { action: 'Tap Get code.', expected: 'The "SMS code sent" notification message is displayed and the resend countdown starts.' }
          ]
        },
        {
          ref: 'PHN-10',
          title: 'Changing the phone number during the countdown re-enables the Get code button',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Enter a valid phone number and tap Get code.', expected: 'The resend countdown starts.' },
            { action: 'Change the last digit of the phone number while the countdown is running.', expected: 'The countdown stops and the Get code button becomes enabled again.' }
          ]
        },
        {
          ref: 'PHN-11',
          title: 'SMS code field accepts only digits',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Enter a valid phone number.', expected: 'The SMS code field becomes enabled.' },
            { action: 'Enter non-digit characters in the SMS code field.', expected: 'Nothing is accepted and the field stays empty.' },
            { action: 'Enter a numeric code.', expected: 'The field holds the entered digits.' }
          ]
        },
        {
          ref: 'PHN-12',
          title: 'Change button stays disabled while any field is empty and enables on a complete form',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          precondition: 'Logged in with the Georgian test account.',
          steps: [
            { action: 'Fill the whole form (personal number, birth year, phone number, SMS code).', expected: 'The Change button becomes enabled.' },
            { action: 'Clear the personal number, then re-enter it.', expected: 'The Change button is disabled while the field is empty and enabled again after it is refilled.' },
            { action: 'Replace the phone number with an incomplete one, then re-enter a valid one.', expected: 'The Change button is disabled for the invalid number and enabled again for the valid one.' },
            { action: 'Clear the SMS code, then re-enter it.', expected: 'The Change button is disabled while the code is empty and enabled again after it is refilled.' }
          ]
        },
        {
          ref: 'PHN-13',
          title: 'Submitting a wrong SMS code shows the wrong SMS code error that clears on edit',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          precondition: 'Logged in with the Georgian test account.',
          steps: [
            { action: 'Enter a valid phone number and tap Get code.', expected: 'The "SMS code sent" message is displayed.' },
            { action: 'Fill the correct personal number and birth year and a wrong SMS code, then tap Change.', expected: 'The request fails with the "wrong SMS code" failure type; the error is displayed only on the SMS code field, while the personal number and birth year fields carry no error.' },
            { action: 'Edit the SMS code.', expected: 'The SMS code error clears and the Change button is enabled again.' }
          ]
        },
        {
          ref: 'PHN-14',
          title: 'Submitting wrong personal details shows the error on the personal number and birth year fields',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          precondition: 'Logged in with the Georgian test account.',
          steps: [
            { action: 'Fill the form with a wrong personal number and a wrong birth year and tap Change.', expected: 'The request fails with the "wrong personal details" failure type and the error is displayed on both the personal number and the birth year fields; the Change button becomes disabled.' },
            { action: 'Correct the personal number.', expected: 'Both field errors clear and the Change button becomes enabled again.' }
          ]
        },
        {
          ref: 'PHN-15',
          title: 'Submitting a correct personal number with a wrong birth year shows the wrong personal details error',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          precondition: 'Logged in with the Georgian test account.',
          steps: [
            { action: 'Fill the form with the correct personal number but a wrong birth year and tap Change.', expected: 'The request fails with the "wrong personal details" failure type and the error is displayed on both fields; the Change button becomes disabled.' },
            { action: 'Select the correct birth year.', expected: 'Both field errors clear and the Change button becomes enabled again.' }
          ]
        },
        {
          ref: 'PHN-16',
          title: 'Requesting the SMS code for an already registered phone number shows the number taken modal and Back returns to the sheet',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          precondition: 'Logged in with the Georgian test account; the target phone number already belongs to another account.',
          steps: [
            { action: 'Fill the personal number and birth year, enter a phone number that is already registered and tap Get code.', expected: 'The "phone already registered" modal is displayed with its title, message and the field error.' },
            { action: 'Tap Back in the modal.', expected: 'The modal is closed and the change number sheet is displayed again.' },
            { action: 'Inspect the form.', expected: 'The phone number field is cleared without an error, while the personal number and birth year values are kept.' }
          ]
        },
        {
          ref: 'PHN-17',
          title: 'Resubmitting the same data keeps the Change button disabled until a field changes',
          tags: ['FAV-SMOKE', 'phone-number-feat'],
          steps: [
            { action: 'Fill the form with wrong personal details and tap Change.', expected: 'The "wrong personal details" error is displayed on the personal number field.' },
            { action: 'Tap Change again without editing anything.', expected: 'The Change button stays disabled so the same data cannot be resubmitted.' },
            { action: 'Select a different birth year.', expected: 'The Change button becomes enabled again.' }
          ]
        }
      ]
    },
    {
      id: 'language',
      name: 'Change language',
      file: 'tests/user_profile/change_language_test.dart',
      precondition: 'The user is logged in; the app language is Georgian.',
      cases: [
        {
          ref: 'LANG-01',
          title: 'Switching the language to English and back to Georgian retranslates the profile screen',
          tags: ['FAV-SMOKE', 'language-feat'],
          steps: [
            { action: 'Open the Profile screen.', expected: 'The profile title is displayed in Georgian.' },
            { action: 'Open the language selector.', expected: 'The language selection sheet is displayed.' },
            { action: 'Select English.', expected: 'The profile title is retranslated to English.' },
            { action: 'Open the selector again and select Georgian.', expected: 'The profile title is retranslated back to Georgian.' }
          ]
        }
      ]
    },
    {
      id: 'notification-settings',
      name: 'Notification / SMS settings',
      file: 'tests/user_profile/sms_configuration_test.dart',
      precondition: 'The user is logged in; Profile > Notification settings is reachable.',
      cases: [
        {
          ref: 'NOTIF-01',
          title: 'Notification settings screen opens from the profile menu with both options',
          tags: ['FAV-SMOKE', 'sms-configuration-feat'],
          steps: [
            { action: 'Open Profile and then Notification settings.', expected: 'The notification settings screen is displayed.' },
            { action: 'Inspect the list.', expected: 'Both the marketing notifications and the system notifications options are displayed with their titles.' }
          ]
        },
        {
          ref: 'NOTIF-02',
          title: 'Marketing notifications sheet opens with the Save button disabled',
          tags: ['FAV-SMOKE', 'sms-configuration-feat'],
          steps: [
            { action: 'Open the marketing notifications settings.', expected: 'The marketing sheet is displayed with the marketing notifications option.' },
            { action: 'Inspect the Save button.', expected: 'The Save button is disabled because nothing has changed yet.' }
          ]
        },
        {
          ref: 'NOTIF-03',
          title: 'Flipping the marketing toggle enables Save and flipping it back disables it',
          tags: ['FAV-SMOKE', 'sms-configuration-feat'],
          steps: [
            { action: 'Open the marketing sheet and note the initial toggle value.', expected: 'The sheet is displayed and the Save button is disabled.' },
            { action: 'Flip the toggle.', expected: 'The toggle value changes and the Save button becomes enabled.' },
            { action: 'Flip the toggle back.', expected: 'The toggle returns to its initial value and the Save button becomes disabled again.' }
          ]
        },
        {
          ref: 'NOTIF-04',
          title: 'Saving the marketing toggle shows the success message and the original value is restored',
          tags: ['FAV-SMOKE', 'sms-configuration-feat'],
          steps: [
            { action: 'Open the marketing sheet, note the initial value, flip the toggle and tap Save.', expected: 'The "settings saved" message is displayed and the sheet is closed.' },
            { action: 'Reopen the marketing sheet, set the toggle back to its initial value and tap Save.', expected: 'The success message is displayed again, the sheet closes and the account is left in its original state.' }
          ]
        },
        {
          ref: 'NOTIF-05',
          title: 'System notifications sheet lists both options with the Save button disabled',
          tags: ['FAV-SMOKE', 'sms-configuration-feat'],
          steps: [
            { action: 'Open the system notifications settings.', expected: 'The sheet is displayed with its title, the login SMS option and the won ticket SMS option.' },
            { action: 'Inspect the Save button.', expected: 'The Save button is disabled because nothing has changed yet.' }
          ]
        },
        {
          ref: 'NOTIF-06',
          title: 'Flipping the login SMS toggle enables Save and flipping it back disables it',
          tags: ['FAV-SMOKE', 'sms-configuration-feat'],
          steps: [
            { action: 'Open the system notifications sheet and note the login SMS toggle value.', expected: 'The sheet is displayed and the Save button is disabled.' },
            { action: 'Flip the login SMS toggle.', expected: 'The toggle value changes and the Save button becomes enabled.' },
            { action: 'Flip the toggle back.', expected: 'The toggle returns to its initial value and the Save button becomes disabled again.' }
          ]
        },
        {
          ref: 'NOTIF-07',
          title: 'Flipping the won ticket SMS toggle enables Save and flipping it back disables it',
          tags: ['FAV-SMOKE', 'sms-configuration-feat'],
          steps: [
            { action: 'Open the system notifications sheet and note the won ticket SMS toggle value.', expected: 'The sheet is displayed and the Save button is disabled.' },
            { action: 'Flip the won ticket SMS toggle.', expected: 'The toggle value changes and the Save button becomes enabled.' },
            { action: 'Flip the toggle back.', expected: 'The toggle returns to its initial value and the Save button becomes disabled again.' }
          ]
        },
        {
          ref: 'NOTIF-08',
          title: 'Saving the won ticket SMS toggle shows the success message and the original value is restored',
          tags: ['FAV-SMOKE', 'sms-configuration-feat'],
          steps: [
            { action: 'Open the system notifications sheet, flip the won ticket SMS toggle and tap Save.', expected: 'The "settings saved" message is displayed and the sheet is closed.' },
            { action: 'Reopen the sheet, set the toggle back to its initial value and tap Save.', expected: 'The success message is displayed again, the sheet closes and the account is left in its original state.' }
          ]
        }
      ]
    },
    {
      id: 'invite-friend',
      name: 'Invite a friend',
      file: 'tests/user_profile/invite_friend_test.dart',
      precondition: 'The user is logged in; Profile > Invite a friend is reachable.',
      cases: [
        {
          ref: 'INV-01',
          title: 'Invite friend screen shows the referral code, the share link and the QR code',
          tags: ['FAV-SMOKE', 'invite-friend-feat'],
          steps: [
            { action: 'Open Profile and then Invite a friend.', expected: 'The invite friend screen is displayed with the referral code and the share link.' },
            { action: 'Inspect the QR area.', expected: 'The QR code is displayed.' }
          ]
        },
        {
          ref: 'INV-02',
          title: 'Copying the invitation code puts it on the clipboard',
          tags: ['invite-friend-feat'],
          steps: [
            { action: 'Open the invite friend screen and read the displayed invitation code.', expected: 'The code value is displayed.' },
            { action: 'Tap the copy button.', expected: 'The clipboard holds exactly the displayed invitation code.' }
          ]
        },
        {
          ref: 'INV-03',
          title: 'Share button opens the native share sheet with the referral link',
          tags: ['invite-friend-feat'],
          steps: [
            { action: 'Open the invite friend screen and read the displayed referral link.', expected: 'The link value is displayed.' },
            { action: 'Tap the share button.', expected: 'The native Android share sheet is opened and carries the referral link host.' },
            { action: 'Dismiss the share sheet.', expected: 'The invite friend screen is displayed again with the same referral link.' }
          ]
        }
      ]
    },
    {
      id: 'promo-code',
      name: 'Promo code',
      file: 'tests/user_profile/promo_code_test.dart',
      precondition: 'The user is logged in; Profile > Promo code is reachable.',
      cases: [
        {
          ref: 'PROMO-01',
          title: 'Invalid promo code shows the activation failed modal and clears the field',
          tags: ['FAV-SMOKE', 'promo-code-feat'],
          steps: [
            { action: 'Open the promo code screen and enter an invalid promo code.', expected: 'The Activate button becomes enabled.' },
            { action: 'Tap Activate.', expected: 'The "activation failed" modal is displayed with an enabled "Try again" button.' },
            { action: 'Tap "Try again".', expected: 'The promo code screen is displayed again and the promo code field is empty.' }
          ]
        },
        {
          ref: 'PROMO-02',
          title: 'Activation failed modal is dismissed with a system back and returns to the promo code screen',
          tags: ['promo-code-feat'],
          steps: [
            { action: 'Enter an invalid promo code and tap Activate.', expected: 'The "activation failed" modal is displayed.' },
            { action: 'Press the Android system Back button.', expected: 'The modal is dismissed and the promo code screen is displayed.' }
          ]
        },
        {
          ref: 'PROMO-03',
          title: 'Tapping the back arrow on the promo code screen returns to the Profile screen',
          tags: ['promo-code-feat'],
          steps: [
            { action: 'Open the promo code screen.', expected: 'The promo code screen is displayed.' },
            { action: 'Tap the back arrow.', expected: 'The Profile screen is displayed.' }
          ]
        }
      ]
    },
    {
      id: 'withdraw',
      name: 'Withdraw',
      file: 'tests/user_profile/withdraw_test.dart',
      precondition: 'The user is logged in and the transfers pop-up is reachable from the navigation bar.',
      cases: [
        {
          ref: 'WD-01',
          title: 'Withdraw tab opens from the transfers switch and shows the no-saved-cards state with its texts',
          tags: ['FAV-SMOKE', 'withdraw-entry-feat', 'withdraw-feat'],
          precondition: 'Logged in with an account that has no saved cards.',
          steps: [
            { action: 'Open the transfers pop-up from the navigation bar.', expected: 'The sheet is displayed, the deposit / withdraw switch labels are correct and the Deposit tab is selected.' },
            { action: 'Tap the Withdraw tab.', expected: 'The Withdraw tab becomes selected.' },
            { action: 'Inspect the withdraw content.', expected: 'The no-saved-cards state is displayed with its texts and the Deposit button on it is enabled.' }
          ]
        },
        {
          ref: 'WD-02',
          title: 'Deposit button on the no-saved-cards state moves the user to the deposit form',
          tags: ['FAV-SMOKE', 'withdraw-entry-feat', 'withdraw-feat'],
          precondition: 'Logged in with an account that has no saved cards.',
          steps: [
            { action: 'Open the Withdraw tab.', expected: 'The no-saved-cards state is displayed.' },
            { action: 'Tap the Deposit button inside the no-saved-cards state.', expected: 'The Deposit tab becomes selected and the deposit form is displayed.' }
          ]
        },
        {
          ref: 'WD-03',
          title: 'Deposit and withdraw switch buttons move between both forms in either direction',
          tags: ['FAV-SMOKE', 'withdraw-entry-feat', 'withdraw-feat'],
          precondition: 'Logged in with an account that has no saved cards.',
          steps: [
            { action: 'Open the transfers pop-up.', expected: 'The switch labels are correct, the Deposit tab is selected and the deposit form is displayed.' },
            { action: 'Tap the Withdraw tab.', expected: 'The Withdraw tab is selected and the no-saved-cards state is displayed.' },
            { action: 'Tap the Deposit tab.', expected: 'The Deposit tab is selected and the deposit form is displayed again.' },
            { action: 'Tap the Withdraw tab once more.', expected: 'The Withdraw tab is selected again and the withdraw content is displayed.' }
          ]
        },
        {
          ref: 'WD-04',
          title: 'Transfers pop-up closes on the X button while the withdraw tab is open',
          tags: ['FAV-SMOKE', 'withdraw-entry-feat', 'withdraw-feat'],
          steps: [
            { action: 'Open the transfers pop-up and switch to the Withdraw tab.', expected: 'The Withdraw tab is selected and its content is displayed.' },
            { action: 'Tap the X button.', expected: 'The transfers pop-up is closed.' }
          ]
        },
        {
          ref: 'WD-05',
          title: 'Withdraw form of a user with saved cards shows the amount field, the balance, the saved cards and a disabled Withdraw button',
          tags: ['FAV-SMOKE', 'withdraw-cards-feat', 'withdraw-feat'],
          precondition: 'Logged in with the withdraw test account (has saved cards).',
          steps: [
            { action: 'Open the Withdraw tab and wait for the withdraw form.', expected: 'The balance row is displayed.' },
            { action: 'Inspect the saved cards.', expected: 'The saved cards are displayed and exactly one of them is selected.' },
            { action: 'Inspect the amount area and the button.', expected: 'The amount field is empty, the commission details are hidden and the Withdraw button is disabled.' }
          ]
        },
        {
          ref: 'WD-06',
          title: 'Amount below the minimum keeps the Withdraw button disabled and names the minimum',
          tags: ['FAV-SMOKE', 'withdraw-amount-feat', 'withdraw-feat'],
          precondition: 'Logged in with the withdraw test account; the withdraw form is open.',
          steps: [
            { action: 'Enter an amount below the minimum withdraw limit.', expected: 'The minimum amount error is displayed and names the minimum.' },
            { action: 'Inspect the form.', expected: 'The commission details stay hidden and the Withdraw button stays disabled.' }
          ]
        },
        {
          ref: 'WD-07',
          title: 'Amount above the wallet balance is rejected with the no-funds message and keeps the Withdraw button disabled',
          tags: ['FAV-SMOKE', 'withdraw-amount-feat', 'withdraw-feat'],
          precondition: 'Logged in with the withdraw test account; the withdraw form is open.',
          steps: [
            { action: 'Enter an amount higher than the available wallet balance.', expected: 'The "not enough funds" error is displayed.' },
            { action: 'Inspect the button.', expected: 'The Withdraw button stays disabled.' }
          ]
        },
        {
          ref: 'WD-08',
          title: 'Amounts above the maximum limit are rejected with the same message one lari over the limit and far above it',
          tags: ['FAV-SMOKE', 'withdraw-amount-feat', 'withdraw-feat'],
          precondition: 'Logged in with the withdraw test account; the withdraw form is open.',
          steps: [
            { action: 'Enter an amount far above the maximum withdraw limit.', expected: 'The maximum amount error is displayed, the commission details stay hidden and the Withdraw button is disabled.' },
            { action: 'Enter an amount exactly one lari above the maximum limit.', expected: 'The same maximum amount error is displayed, the commission details stay hidden and the Withdraw button is disabled.' }
          ]
        },
        {
          ref: 'WD-09',
          title: 'Valid amount displays the commission rows and enables the Withdraw button',
          tags: ['FAV-SMOKE', 'withdraw-amount-feat', 'withdraw-feat'],
          precondition: 'Logged in with the withdraw test account; the withdraw form is open.',
          steps: [
            { action: 'Enter a valid withdraw amount.', expected: 'No amount error is displayed.' },
            { action: 'Inspect the form.', expected: 'The commission detail rows are displayed and the Withdraw button becomes enabled.' }
          ]
        },
        {
          ref: 'WD-10',
          title: 'Withdraw button follows the amount when a valid amount is replaced by an invalid one and typed again',
          tags: ['FAV-SMOKE', 'withdraw-amount-feat', 'withdraw-feat'],
          precondition: 'Logged in with the withdraw test account; the withdraw form is open.',
          steps: [
            { action: 'Enter a valid withdraw amount.', expected: 'The commission details are displayed and the Withdraw button is enabled.' },
            { action: 'Replace it with an amount below the minimum.', expected: 'The minimum amount error is displayed and the Withdraw button becomes disabled.' },
            { action: 'Enter the valid amount again.', expected: 'The error clears, the commission details are displayed again and the Withdraw button becomes enabled.' }
          ]
        },
        {
          ref: 'WD-11',
          title: 'Predefined amount fills the amount field and enables the Withdraw button',
          tags: ['FAV-SMOKE', 'withdraw-amount-feat', 'withdraw-feat'],
          precondition: 'Logged in with the withdraw test account; the withdraw form is open.',
          steps: [
            { action: 'Focus the amount field.', expected: 'The predefined amount presets are displayed.' },
            { action: 'Tap the first preset.', expected: 'The amount field holds the preset value and no amount error is displayed.' },
            { action: 'Inspect the form.', expected: 'The commission details are displayed and the Withdraw button becomes enabled.' }
          ]
        },
        {
          ref: 'WD-12',
          title: 'Selecting another saved card moves the selection and keeps the withdraw form usable',
          tags: ['FAV-SMOKE', 'withdraw-cards-feat', 'withdraw-feat'],
          precondition: 'Logged in with the withdraw test account; at least 2 saved cards.',
          steps: [
            { action: 'Open the withdraw form and inspect the saved cards.', expected: 'At least 2 cards are displayed and the first one is selected.' },
            { action: 'Select the second card.', expected: 'The selection moves to the second card.' },
            { action: 'Enter a valid withdraw amount.', expected: 'No error is displayed, the commission details appear and the Withdraw button becomes enabled.' }
          ]
        }
      ]
    }
  ]
});
