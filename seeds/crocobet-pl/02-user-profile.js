window.TEST_DATA.suites.push({
  id: 'user-profile',
  name: 'User profile',
  nameKa: 'მომხმარებლის პროფილი',
  icon: 'user',
  summary: 'Profile screen, personal information and settings for the Polish app.',
  groups: [
    {
      id: 'personal-info',
      name: 'Personal information',
      file: 'tests/user_profile/personal_information_test.dart',
      precondition: 'The user is logged in; Profile > Personal information is open.',
      cases: [
        {
          ref: 'PL-10',
          title: 'Personal details section lists every field with a value',
          tags: ['FAV-SMOKE', 'personal-info-feat'],
          steps: [
            { action: 'Open Profile and then Personal information.', expected: 'The Personal information screen is displayed.' },
            { action: 'Inspect the personal details section.', expected: 'Every field is displayed with its value.' }
          ]
        }
      ]
    }
  ]
});
