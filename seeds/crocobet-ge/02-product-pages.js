window.TEST_DATA.suites.push({
  id: 'product-pages',
  name: 'Product pages',
  nameKa: 'პროდუქტის გვერდები',
  icon: 'grid',
  summary: 'Slots / Casino / Fast games pages: banners, category and provider filters, favorites, search, jackpots and top winners.',
  groups: [
    {
      id: 'game-category-filters-and-blocks',
      name: 'Game category filters and blocks',
      file: 'tests/product_pages/game_category_filters_and_blocks_test.dart',
      precondition: 'The user is logged in and on the Home screen.',
      cases: [
        {
          ref: 'FAV2-104',
          title: 'Slots, Casino and Fast games page loads with the default state showing the All filter and the game category blocks',
          tags: ['FAV-SMOKE', 'category-filters-feat'],
          steps: [
            { action: 'Open the Slots page from the bottom navigation.', expected: 'The Slots page is displayed.' },
            { action: 'Inspect the filter row.', expected: 'The "All" filter is selected by default.' },
            { action: 'Inspect the page content.', expected: 'The game category blocks are visible and games are displayed inside them.' }
          ]
        },
        {
          ref: 'FAV2-114',
          title: 'Each category block displays the primary block quantity from the admin configuration',
          tags: ['category-filters-feat'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The Slots page is displayed.' },
            { action: 'Inspect every category block.', expected: 'The category block headers are displayed and every block is filled with game tiles.' }
          ]
        },
        {
          ref: 'FAV2-115',
          title: 'Customer can scroll each game category filters block',
          tags: ['category-filters-feat'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The category blocks are visible.' },
            { action: 'Scroll the games inside a category block horizontally.', expected: 'The block scrolls and further games become visible.' }
          ]
        },
        {
          ref: 'FAV2-116',
          title: 'Clicking the "All" button displays all games under that category',
          tags: ['category-filters-feat'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The category blocks are visible.' },
            { action: 'Tap the "All" / "See all" button of the first category block.', expected: 'The category is expanded and all games of that category are displayed in a grid.' }
          ]
        }
      ]
    },
    {
      id: 'category-navigation',
      name: 'Category and subcategory navigation',
      file: 'tests/product_pages/category_and_subcategory_navigation_test.dart',
      precondition: 'The user is logged in and on the Home screen.',
      cases: [
        {
          ref: 'FAV2-110',
          title: 'Subcategories list is displayed in the configured order',
          tags: ['category-navigation-feat'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The Slots page is displayed.' },
            { action: 'Inspect the subcategory row.', expected: 'The subcategories are displayed in the order configured in the admin panel.' }
          ]
        },
        {
          ref: 'FAV2-111',
          title: 'Each subcategory displays a name and an icon',
          tags: ['category-navigation-feat'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The Slots page is displayed.' },
            { action: 'Inspect every subcategory chip.', expected: 'Each subcategory shows both its name and its icon.' }
          ]
        },
        {
          ref: 'FAV2-112 + FAV2-113',
          title: 'Customer can scroll the subcategories list horizontally',
          tags: ['category-navigation-feat'],
          merged: ['FAV2-112', 'FAV2-113'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The subcategory row is displayed.' },
            { action: 'Swipe the subcategory row left and right.', expected: 'The row scrolls horizontally in both directions and previously hidden subcategories become visible.' }
          ]
        },
        {
          ref: 'FAV2-350',
          title: 'Games Filter and Search pop-up is not accessible in landscape mode',
          tags: ['category-navigation-feat'],
          steps: [
            { action: 'Open the Slots page, select the first category filter and open the first filtered game.', expected: 'The game screen is displayed and the games filter sheet is available.' },
            { action: 'Rotate the device to landscape.', expected: 'Landscape mode is active.' },
            { action: 'Try to reach the games filter / search sheet.', expected: 'The sheet is not accessible in landscape mode.' },
            { action: 'Restore the original orientation.', expected: 'The portrait layout is restored.' }
          ]
        }
      ]
    },
    {
      id: 'favorites',
      name: 'Filtering and favorites',
      file: 'tests/product_pages/filtering_and_favorites_test.dart',
      precondition: 'The user is logged in and on the Home screen.',
      cases: [
        {
          ref: 'FAV2-119',
          title: '"Add to Favorite" button is displayed on each game',
          tags: ['favorites-feat'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The category blocks are visible.' },
            { action: 'Inspect every game tile.', expected: 'Each game carries an "Add to Favorite" icon button.' }
          ]
        },
        {
          ref: 'FAV2-127 + FAV2-128 + FAV2-122',
          title: 'Customer can add and remove a game from favorites and filter by Favorites',
          tags: ['favorites-feat'],
          merged: ['FAV2-127', 'FAV2-128', 'FAV2-122'],
          steps: [
            { action: 'Open the Slots page and tap the favorite button of the first non-favorite game.', expected: 'The game is marked as a favorite.' },
            { action: 'Open the Favorites filter.', expected: 'The favorites list contains the game and only favorite games are displayed.' },
            { action: 'Unfavorite the same game.', expected: 'The game is no longer marked as a favorite and disappears from the favorites list.' }
          ]
        },
        {
          ref: 'FAV2-123 + FAV2-125',
          title: 'Filtering by provider displays only that provider games and combines with a category filter using AND logic',
          tags: ['favorites-feat'],
          merged: ['FAV2-123', 'FAV2-125'],
          steps: [
            { action: 'Open the Slots page and select the first provider.', expected: 'The provider is selected and the filtered games grid is displayed.' },
            { action: 'Inspect the filtered games.', expected: 'All displayed games belong to the selected provider and the category filter chips are updated for that provider.' },
            { action: 'Additionally select the first category filter.', expected: 'The grid is refiltered, the provider stays selected and the two filters are combined with AND logic.' }
          ]
        },
        {
          ref: 'FAV2-124 + FAV2-126',
          title: 'Filtering by a category filter displays the appropriate games and can be unselected',
          tags: ['favorites-feat'],
          merged: ['FAV2-124', 'FAV2-126'],
          steps: [
            { action: 'Open the Slots page and select the first category filter.', expected: 'The filtered results are displayed and every game belongs to the selected filter.' },
            { action: 'Tap the selected category filter again to unselect it.', expected: 'The filter is cleared and the filtered results disappear.' }
          ]
        },
        {
          ref: 'FAV2-351 + FAV2-352',
          title: 'Landscape is blocked while the Search and Filter pop-up is open and restored after closing it',
          tags: ['favorites-feat'],
          merged: ['FAV2-351', 'FAV2-352'],
          steps: [
            { action: 'Open the Slots page, apply a category filter and open the first filtered game.', expected: 'The game screen is displayed with the games filter sheet available.' },
            { action: 'Open the games filter sheet.', expected: 'Landscape orientation is blocked while the sheet is open.' },
            { action: 'Close the games filter sheet.', expected: 'Landscape orientation is allowed again.' }
          ]
        }
      ]
    },
    {
      id: 'filter-state',
      name: 'Filter state preservation',
      file: 'tests/product_pages/filter_state_preservation_test.dart',
      precondition: 'The user is logged in and on the Home screen.',
      cases: [
        {
          ref: 'FAV2-368',
          title: 'Filter state preservation with the maximum number of simultaneous filters',
          tags: ['filter-state-feat'],
          steps: [
            { action: 'Open the Slots page, select the first provider and then the first category filter.', expected: 'The filtered results are displayed and the provider stays selected.' },
            { action: 'Open the first filtered game.', expected: 'The game screen is opened.' },
            { action: 'Press the Android system Back button.', expected: 'The user returns to the Slots page.' },
            { action: 'Inspect the filters and the grid.', expected: 'The provider is still selected and the filtered results are preserved.' }
          ]
        }
      ]
    },
    {
      id: 'search',
      name: 'Game search',
      file: 'tests/product_pages/game_search_test.dart',
      precondition: 'The user is logged in and on the Home screen.',
      cases: [
        {
          ref: 'FAV2-140',
          title: 'Basic search functionality with instant results',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: 'Open the Slots page, open Search and type the first 3 characters of a known game name.', expected: 'Results are displayed instantly and contain the expected game.' },
            { action: 'Extend the query to 5 characters.', expected: 'Results are still displayed, still contain the game, and the result set is narrower than for the 3 character query.' }
          ]
        },
        {
          ref: 'FAV2-141',
          title: 'Clicking a search result launches the game',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: 'Open Search on the Slots page and type the first 3 characters of a known game name.', expected: 'Search results are displayed.' },
            { action: 'Tap the first result.', expected: 'The game screen is opened.' }
          ]
        },
        {
          ref: 'FAV2-329 + FAV2-363',
          title: 'Search validation on the 3 character boundary in Slots search',
          tags: ['FAV-SMOKE', 'search-feat'],
          merged: ['FAV2-329', 'FAV2-363'],
          steps: [
            { action: 'Open Search on the Slots page and enter 2 characters (ab).', expected: 'The "query too short" hint is displayed and no search is executed.' },
            { action: 'Enter 3 characters (abc).', expected: 'The hint disappears and the search is executed.' }
          ]
        },
        {
          ref: 'FAV2-332',
          title: '"No game found" message when the search returns no results in Slots search',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: 'Open Search on the Slots page and enter a query with no matches (xyz123).', expected: 'The "No game found" empty state is displayed.' }
          ]
        },
        {
          ref: 'FAV2-338',
          title: 'Search validation on the Casino page with less than 3 characters',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: 'Open Explore and then the Casino page.', expected: 'The Casino page is displayed.' },
            { action: 'Open Search and enter 1 character (a).', expected: 'The "query too short" hint is displayed and no search is executed.' }
          ]
        },
        {
          ref: 'FAV2-364',
          title: 'Search behaviour with extremely long input',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: 'Open Search on the Slots page and enter a 1000 character query.', expected: 'The search pop-up and the search field stay in the tree and the query is kept literally in the search state.' }
          ]
        },
        {
          ref: 'FAV2-365',
          title: 'Search with special characters and SQL injection patterns',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: "Open Search and enter the SQL injection pattern ' OR '1'='1", expected: 'The query is kept literally in the search state as plain text and the search pop-up is not torn down.' },
            { action: 'Enter an XSS pattern (<script>alert(\'XSS\')</script>).', expected: 'The query is kept literally in the search state and the search field stays usable.' },
            { action: 'Enter emoji only (slot / dice / joker).', expected: 'The query is kept literally in the search state and the pop-up stays open.' }
          ]
        },
        {
          ref: 'FAV2-375',
          title: 'Search results with unicode and multi-byte characters',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: 'Open Search and enter a Georgian query (ქართული).', expected: 'The query is kept literally in the search state and the pop-up stays open.' },
            { action: 'Enter a Japanese query (日本語のゲーム).', expected: 'The multi-byte query is kept literally in the search state and the search field stays in the tree.' },
            { action: 'Enter an accented Latin query (Ñoño).', expected: 'The query is kept literally in the search state and the pop-up stays open.' }
          ]
        },
        {
          ref: 'FAV2-383',
          title: 'Search with only whitespace characters',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: 'Open Search on the Slots page and enter three spaces.', expected: 'The query is treated as too short: the hint is displayed and no search is executed.' }
          ]
        },
        {
          ref: 'FAV2-385',
          title: 'Swipe down gesture on the search pop-up with a partial swipe',
          tags: ['FAV-SMOKE', 'search-feat'],
          steps: [
            { action: 'Open Search on the Slots page and swipe the pop-up down partially.', expected: 'The pop-up springs back and stays open.' },
            { action: 'Swipe the pop-up down fully.', expected: 'The search pop-up is closed.' }
          ]
        }
      ]
    },
    {
      id: 'banners',
      name: 'Banners',
      file: 'tests/product_pages/banners_test.dart',
      precondition: 'The user is logged in; more than one banner is configured for the page.',
      cases: [
        {
          ref: 'FAV2-267',
          title: 'Customer can manually scroll banners forward and backward',
          tags: ['banners-feat'],
          steps: [
            { action: 'Open the Slots page and inspect the banner carousel.', expected: 'The carousel is displayed and more than one banner is configured.' },
            { action: 'Swipe the carousel forward.', expected: 'The next banner is displayed.' },
            { action: 'Swipe the carousel backward.', expected: 'The previous banner is displayed.' },
            { action: 'Swipe forward from the last banner.', expected: 'The carousel loops back to the first banner.' }
          ]
        },
        {
          ref: 'FAV2-268',
          title: 'Banners scroll automatically within the configured time interval',
          tags: ['banners-feat'],
          steps: [
            { action: 'Open the Slots page and wait without touching the carousel.', expected: 'The carousel advances to the next banner automatically within the configured interval.' },
            { action: 'Keep waiting until the last banner is reached.', expected: 'The auto-advance loops from the last banner back to the first one.' }
          ]
        },
        {
          ref: 'FAV2-269',
          title: 'Clicking a banner redirects to the configured URL',
          tags: ['banners-feat'],
          steps: [
            { action: 'Open the Slots page and tap the currently displayed banner.', expected: 'A web view is opened on the URL configured for that banner.' }
          ]
        },
        {
          ref: 'FAV2-272',
          title: 'Each page shows only its own configured banners',
          tags: ['banners-feat'],
          steps: [
            { action: 'On the Home page, count the displayed banners.', expected: 'The Home banner carousel is displayed with its own banner count.' },
            { action: 'Open the Slots page and count the banners.', expected: 'The Slots banner count differs from the Home count.' },
            { action: 'Go back to the Home page.', expected: 'The original Home banner count is displayed again.' }
          ]
        }
      ]
    },
    {
      id: 'jackpots',
      name: 'Jackpots',
      file: 'tests/product_pages/jackpots_test.dart',
      precondition: 'The user is logged in; jackpots are configured and active.',
      cases: [
        {
          ref: 'FAV2-132',
          title: 'Jackpots display on the Slots page',
          tags: ['jackpots-feat'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The jackpot carousel and the jackpot cards are displayed.' },
            { action: 'Compare the rendered amounts with the loaded jackpot data.', expected: 'The jackpot data is loaded and the displayed amounts match the loaded values.' },
            { action: 'Observe the amounts over time.', expected: 'Live jackpot updates keep running and the amounts refresh.' }
          ]
        }
      ]
    },
    {
      id: 'top-winners',
      name: 'Top winners',
      file: 'tests/product_pages/top_winners_test.dart',
      precondition: 'The user is logged in and on the Home screen.',
      cases: [
        {
          ref: 'FAV2-186 + FAV2-214',
          title: 'Top Wins section is displayed on the Home page on initial load',
          tags: ['FAV-SMOKE', 'top-winners-feat'],
          merged: ['FAV2-186', 'FAV2-214'],
          steps: [
            { action: 'Open the Home page.', expected: 'The Top Wins section is displayed.' },
            { action: 'Count the winner cards.', expected: 'At least 10 winner records are displayed.' }
          ]
        },
        {
          ref: 'FAV2-187 + FAV2-190 + FAV2-192',
          title: 'Top Wins section on the Slots page displays the default records with all card fields',
          tags: ['top-winners-feat'],
          merged: ['FAV2-187', 'FAV2-190', 'FAV2-192'],
          steps: [
            { action: 'Open the Slots page.', expected: 'The Top Wins section is displayed with at least 10 records.' },
            { action: 'Compare the rendered cards with the loaded winners.', expected: 'The rendered cards match the loaded winner data.' },
            { action: 'Inspect every card.', expected: 'Each card carries all of its fields (player, game, win amount, coefficient).' }
          ]
        },
        {
          ref: 'FAV2-203 + FAV2-204',
          title: 'Win amount is displayed with the lari symbol and the coefficient in multiplier format',
          tags: ['top-winners-feat'],
          merged: ['FAV2-203', 'FAV2-204'],
          steps: [
            { action: 'Open the Home page and inspect the Top Wins cards.', expected: 'Every win amount carries the lari symbol and every coefficient is rendered in the multiplier (x) format.' }
          ]
        },
        {
          ref: 'FAV2-195 + FAV2-196 + FAV2-255 + FAV2-199',
          title: 'View All opens the Top Wins modal on the daily period with fully populated rows',
          tags: ['top-winners-feat'],
          merged: ['FAV2-195', 'FAV2-196', 'FAV2-255', 'FAV2-199'],
          steps: [
            { action: 'Open the Home page and tap "View All" in the Top Wins section.', expected: 'The Top Wins modal is displayed.' },
            { action: 'Inspect the selected period and the rows.', expected: 'The daily period is selected by default and every modal row carries all of its fields.' }
          ]
        },
        {
          ref: 'FAV2-200',
          title: 'Pop-up list is sorted by win amount in descending order',
          tags: ['top-winners-feat'],
          steps: [
            { action: 'Open the Top Wins modal from "View All".', expected: 'The modal is displayed.' },
            { action: 'Inspect the row order.', expected: 'The rows are sorted by win amount in descending order.' }
          ]
        },
        {
          ref: 'FAV2-209',
          title: 'Switching between the Daily and Monthly tabs updates the displayed data',
          tags: ['top-winners-feat'],
          steps: [
            { action: 'Open the Top Wins modal from "View All".', expected: 'The modal is displayed with the daily period selected.' },
            { action: 'Switch to the Monthly tab.', expected: 'The monthly data is loaded and displayed, still sorted by win amount in descending order.' }
          ]
        },
        {
          ref: 'FAV2-208',
          title: 'Modal can be closed after opening',
          tags: ['top-winners-feat'],
          steps: [
            { action: 'Open the Top Wins modal from "View All".', expected: 'The modal is displayed.' },
            { action: 'Tap the close button.', expected: 'The modal is closed and the user returns to the Home page.' }
          ]
        },
        {
          ref: 'FAV2-201 + FAV2-202',
          title: 'Tapping rows in the Top Wins modal opens each game',
          tags: ['top-winners-feat'],
          merged: ['FAV2-201', 'FAV2-202'],
          steps: [
            { action: 'Open the Top Wins modal from "View All".', expected: 'The modal is displayed with winner rows.' },
            { action: 'Tap the winner rows one by one.', expected: 'Each row opens the game it refers to.' }
          ]
        }
      ]
    }
  ]
});
