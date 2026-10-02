window.TEST_DATA.suites.push({
  id: 'transfers',
  name: 'Transfers / Deposit',
  nameKa: 'ტრანსფერები / დეპოზიტი',
  icon: 'card',
  summary: 'Deposit pop-up entry points, amount validation and limits, payment methods, saved cards and other payment methods.',
  groups: [
    {
      id: 'deposit-entry',
      name: 'Deposit entry points',
      file: 'tests/transfers/deposit_entry_test.dart',
      precondition: 'The user is logged in and on the Home screen.',
      cases: [
        {
          ref: 'FAV2-747 + FAV2-827 + FAV2-748',
          title: 'Deposit pop-up opens from the navigation bar with the expected header and form and closes on the X button',
          tags: ['FAV-SMOKE', 'deposit-entry-feat', 'deposit-feat'],
          merged: ['FAV2-747', 'FAV2-827', 'FAV2-748'],
          steps: [
            { action: 'Tap the Deposit button in the bottom navigation bar.', expected: 'The transfers sheet is displayed.' },
            { action: 'Inspect the header and the selected tab.', expected: 'The header elements are displayed and the Deposit tab is selected.' },
            { action: 'Inspect the form.', expected: 'The deposit form content (amount field, methods, continue button) is displayed.' },
            { action: 'Tap the X button.', expected: 'The transfers sheet is closed.' }
          ]
        },
        {
          ref: 'FAV2-825',
          title: 'Deposit pop-up can be accessed from the Deposit button on the Profile screen',
          tags: ['FAV-SMOKE', 'deposit-entry-feat', 'deposit-feat'],
          steps: [
            { action: 'Open the Profile screen.', expected: 'The Profile screen is displayed.' },
            { action: 'Tap the Deposit button on the Profile screen.', expected: 'The transfers sheet is displayed with the Deposit tab selected and the deposit form content visible.' }
          ]
        },
        {
          ref: 'FAV2-1232',
          title: 'Deposit pop-up can be opened from the in-game panel',
          tags: ['FAV-SMOKE', 'deposit-entry-feat', 'deposit-feat'],
          steps: [
            { action: 'Open the Slots page, apply a category filter and launch the first filtered game.', expected: 'The game screen is opened.' },
            { action: 'Tap the Deposit button in the in-game panel.', expected: 'The transfers sheet is displayed with the Deposit tab selected.' },
            { action: 'Tap the X button.', expected: 'The sheet is closed and the user stays in the game.' }
          ]
        },
        {
          ref: 'FAV2-1233',
          title: 'Top bar deposit button displays the current balance and opens the deposit pop-up',
          tags: ['FAV-SMOKE', 'deposit-entry-feat', 'deposit-feat'],
          steps: [
            { action: 'Open the Slots page and inspect the top bar deposit button.', expected: 'The button shows the current wallet balance.' },
            { action: 'Tap the top bar deposit button.', expected: 'The transfers sheet is displayed with the Deposit tab selected.' }
          ]
        },
        {
          ref: 'FAV2-823',
          title: 'Deposit pop-up state when the user leaves the payment page and returns',
          tags: ['FAV-SMOKE', 'deposit-entry-feat', 'deposit-feat'],
          precondition: 'The start-deposit repository is replaced by a fake implementation.',
          steps: [
            { action: 'Open the deposit pop-up and enter the amount 20.', expected: 'The Continue button becomes enabled.' },
            { action: 'Tap Continue and select the first payment provider.', expected: 'The payment page is opened and carries the expected return URLs.' },
            { action: 'Leave the payment page.', expected: 'The payment page is closed and the transfers sheet is displayed again.' },
            { action: 'Close the sheet with X and reopen it from the navigation bar.', expected: 'The sheet reopens on the Deposit tab and the deposit was started exactly once.' }
          ]
        }
      ]
    },
    {
      id: 'deposit-amount',
      name: 'Deposit amount and limits',
      file: 'tests/transfers/deposit_amount_test.dart',
      precondition: 'The user is logged in and the transfers sheet is open on the Deposit tab.',
      cases: [
        {
          ref: 'FAV2-758 + FAV2-759 + FAV2-767',
          title: 'Predefined deposit amounts are displayed, populate the amount field and enable the Continue button',
          tags: ['FAV-SMOKE', 'deposit-amount-feat', 'deposit-feat'],
          merged: ['FAV2-758', 'FAV2-759', 'FAV2-767'],
          steps: [
            { action: 'Focus the amount field.', expected: 'The predefined amount presets are displayed.' },
            { action: 'Tap the first preset.', expected: 'The amount field holds the preset value and the Continue button becomes enabled.' }
          ]
        },
        {
          ref: 'FAV2-762 + FAV2-791 + FAV2-792 + FAV2-766',
          title: 'Amounts below the minimum and negative amounts keep the Continue button disabled',
          tags: ['FAV-SMOKE', 'deposit-amount-feat', 'deposit-feat'],
          merged: ['FAV2-762', 'FAV2-791', 'FAV2-792', 'FAV2-766'],
          steps: [
            { action: 'Enter the amount 0.', expected: 'The Continue button stays disabled.' },
            { action: 'Enter the amount 0.99.', expected: 'The minimum limit error is displayed and the Continue button stays disabled.' },
            { action: 'Enter the amount -100.', expected: 'The Continue button stays disabled.' },
            { action: 'Enter the amount 20.', expected: 'No error is displayed and the Continue button becomes enabled.' }
          ]
        },
        {
          ref: 'FAV2-794 + FAV2-806 + FAV2-811 + FAV2-761',
          title: 'Malformed and non-numeric amounts are normalised or rejected',
          tags: ['FAV-SMOKE', 'deposit-amount-feat', 'deposit-feat'],
          merged: ['FAV2-794', 'FAV2-806', 'FAV2-811', 'FAV2-761'],
          steps: [
            { action: 'Enter letters (abc) in the amount field.', expected: 'The input is rejected and does not reach the amount field.' },
            { action: 'Enter an amount with two separators (10.50.25).', expected: 'The input is rejected.' },
            { action: 'Enter an amount with excessive decimals (100.999999999).', expected: 'The input is rejected.' },
            { action: 'Enter an amount with leading zeros (00050).', expected: 'The amount is normalised to 50.' }
          ]
        },
        {
          ref: 'FAV2-790 + FAV2-820',
          title: 'Provider maximum is accepted and amounts above it are rejected',
          tags: ['FAV-SMOKE', 'deposit-amount-feat', 'deposit-feat'],
          merged: ['FAV2-790', 'FAV2-820'],
          steps: [
            { action: 'Enter exactly the maximum amount allowed by the provider.', expected: 'No error is displayed and the Continue button is enabled.' },
            { action: 'Enter an amount far above the maximum (2147483647).', expected: 'The maximum limit error is displayed and the Continue button is disabled.' }
          ]
        },
        {
          ref: 'FAV2-1236',
          title: 'Amount limits are refreshed when switching between deposit method tabs',
          tags: ['FAV-SMOKE', 'deposit-amount-feat', 'deposit-feat'],
          steps: [
            { action: 'Open the deposit form and read the current amount limits on the Card tab.', expected: 'The Card tab limits are displayed.' },
            { action: 'Switch to the MBank tab and select the first bank provider.', expected: 'The amount limits change from the Card tab limits.' },
            { action: 'Enter an amount below the MBank minimum.', expected: 'The minimum limit error is displayed.' },
            { action: 'Switch back to the Card tab.', expected: 'The original Card tab limits are restored.' }
          ]
        },
        {
          ref: 'FAV2-1237',
          title: 'Limits are refreshed when switching the payment provider',
          tags: ['FAV-SMOKE', 'deposit-amount-feat', 'deposit-feat'],
          steps: [
            { action: 'Switch to the MBank tab and select the first bank provider.', expected: 'The displayed limits match the selected bank provider.' },
            { action: 'Select the second bank provider.', expected: 'The displayed limits are refreshed and match the newly selected provider.' }
          ]
        }
      ]
    },
    {
      id: 'deposit-methods',
      name: 'Deposit methods',
      file: 'tests/transfers/deposit_methods_test.dart',
      precondition: 'The user is logged in and the transfers sheet is open on the Deposit tab.',
      cases: [
        {
          ref: 'FAV2-752',
          title: 'User without saved cards sees the no-cards state on the Card tab',
          tags: ['FAV-SMOKE', 'deposit-methods-feat', 'deposit-feat'],
          precondition: 'The account has no saved cards.',
          steps: [
            { action: 'Open the deposit form on the Card tab.', expected: 'The no-saved-cards state is displayed and the Continue button is disabled.' },
            { action: 'Enter the amount 20.', expected: 'The Continue button becomes enabled.' }
          ]
        },
        {
          ref: 'FAV2-1240 + FAV2-788',
          title: 'MBank tab lists only active bank providers',
          tags: ['FAV-SMOKE', 'deposit-methods-feat', 'deposit-feat'],
          merged: ['FAV2-1240', 'FAV2-788'],
          steps: [
            { action: 'Open the deposit form and switch to the MBank tab.', expected: 'The bank provider list is displayed.' },
            { action: 'Inspect the listed providers.', expected: 'Only providers that are active in the admin configuration are displayed.' }
          ]
        },
        {
          ref: 'FAV2-1241',
          title: 'MBank Continue button requires both a provider and a valid amount',
          tags: ['FAV-SMOKE', 'deposit-methods-feat', 'deposit-feat'],
          steps: [
            { action: 'Switch to the MBank tab and enter the amount 20 without selecting a provider.', expected: 'The Continue button stays disabled.' },
            { action: 'Select the first bank provider.', expected: 'The provider is marked as selected and the Continue button becomes enabled.' },
            { action: 'Clear the amount field.', expected: 'The Continue button becomes disabled again.' }
          ]
        },
        {
          ref: 'FAV2-1242',
          title: 'NEW badge is displayed on the MBank deposit tab',
          tags: ['FAV-SMOKE', 'deposit-methods-feat', 'deposit-feat'],
          steps: [
            { action: 'Open the deposit form and inspect the MBank tab.', expected: 'The MBank tab carries the NEW badge.' }
          ]
        }
      ]
    },
    {
      id: 'deposit-saved-cards',
      name: 'Deposit with saved cards',
      file: 'tests/transfers/deposit_saved_cards_test.dart',
      precondition: 'Logged in with the card test account (an account that has saved cards).',
      cases: [
        {
          ref: 'FAV2-749',
          title: 'Saved cards are displayed when the user has existing cards',
          tags: ['FAV-SMOKE', 'deposit-saved-cards-feat', 'deposit-feat'],
          steps: [
            { action: 'Open the deposit form on the Card tab.', expected: 'The saved cards are displayed.' },
            { action: 'Inspect the card selection.', expected: 'Exactly one card is selected.' }
          ]
        },
        {
          ref: 'FAV2-751 + FAV2-753',
          title: 'New card tile opens the provider picker with the active providers',
          tags: ['FAV-SMOKE', 'deposit-saved-cards-feat', 'deposit-feat'],
          merged: ['FAV2-751', 'FAV2-753'],
          steps: [
            { action: 'Open the deposit form and tap the "new card" tile.', expected: 'The new card tile becomes the selected one.' },
            { action: 'Enter the amount 20 and open the provider picker.', expected: 'The provider picker is displayed with the active providers.' },
            { action: 'Close the provider picker.', expected: 'The picker is closed and the deposit form is displayed again.' }
          ]
        },
        {
          ref: 'FAV2-754',
          title: 'Selecting another saved card moves the selection',
          tags: ['FAV-SMOKE', 'deposit-saved-cards-feat', 'deposit-feat'],
          precondition: 'The account has at least 2 saved cards.',
          steps: [
            { action: 'Select the first saved card.', expected: 'The first card is marked as selected.' },
            { action: 'Select the second saved card.', expected: 'The selection moves to the second card and the first one is deselected.' }
          ]
        },
        {
          ref: 'FAV2-795',
          title: 'Rapidly switching between saved cards leaves a single selection',
          tags: ['FAV-SMOKE', 'deposit-saved-cards-feat', 'deposit-feat'],
          precondition: 'The account has at least 3 saved cards.',
          steps: [
            { action: 'Tap cards 1, 2 and 3 in rapid succession, twice in a row.', expected: 'Every tap is accepted and the card list stays rendered.' },
            { action: 'Inspect the selection after the last tap.', expected: 'Only the last tapped card (the third one) is selected.' }
          ]
        },
        {
          ref: 'FAV2-768',
          title: 'Every saved card opens its own bank payment page',
          tags: ['FAV-SMOKE', 'deposit-saved-cards-feat', 'deposit-feat'],
          precondition: 'The account has at least 3 saved cards.',
          steps: [
            { action: 'For each saved card: open the deposit form, select the card, enter the amount 1 and continue.', expected: 'The payment page of the bank belonging to that card is opened.' },
            { action: 'Close the payment page and the sheet after each card, then repeat for the next card.', expected: 'The payment page and the sheet close correctly between iterations.' },
            { action: 'Compare the reached hosts with the cards.', expected: 'Every card reached its own bank payment host.' }
          ]
        },
        {
          ref: 'FAV2-755 + FAV2-756',
          title: 'Delete-card dialog is shown from the context menu and cancelling keeps the card',
          tags: ['FAV-SMOKE', 'deposit-saved-cards-feat', 'deposit-feat'],
          merged: ['FAV2-755', 'FAV2-756'],
          steps: [
            { action: 'Open the context menu of the first saved card and choose delete.', expected: 'The delete confirmation dialog is displayed.' },
            { action: 'Tap Cancel.', expected: 'The dialog is closed.' },
            { action: 'Inspect the saved cards list.', expected: 'The card count is unchanged and the card is still saved.' }
          ]
        },
        {
          ref: 'FAV2-1239',
          title: 'Repeat-last-amount button fills the previous amount and confirms it',
          tags: ['FAV-SMOKE', 'deposit-saved-cards-feat', 'deposit-feat'],
          precondition: 'The account has at least one previous deposit.',
          steps: [
            { action: 'Open the deposit form and wait until the repeat-last-amount button is enabled.', expected: 'The repeat-last-amount button is enabled.' },
            { action: 'Tap the repeat-last-amount button.', expected: 'The "last amount prefilled" notice is displayed, the amount matches the previous deposit and the Continue button is enabled.' }
          ]
        }
      ]
    },
    {
      id: 'deposit-other-methods',
      name: 'Other payment methods',
      file: 'tests/transfers/deposit_other_methods_test.dart',
      precondition: 'The user is logged in and the transfers sheet is open on the Deposit tab.',
      cases: [
        {
          ref: 'FAV2-780',
          title: 'Other payment methods sheet lists the additional options',
          tags: ['FAV-SMOKE', 'deposit-other-methods-feat', 'deposit-feat'],
          steps: [
            { action: 'Open the deposit form and tap "Other payment methods".', expected: 'The other payment methods sheet is displayed with the additional options.' }
          ]
        },
        {
          ref: 'FAV2-781',
          title: 'Cashdesk entry opens the cashdesk screen',
          tags: ['FAV-SMOKE', 'deposit-other-methods-feat', 'deposit-feat'],
          steps: [
            { action: 'Open the other payment methods sheet.', expected: 'The additional options are displayed.' },
            { action: 'Tap the cashdesk entry.', expected: 'The cashdesk screen is opened.' }
          ]
        }
      ]
    }
  ]
});
