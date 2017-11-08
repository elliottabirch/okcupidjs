// require('./db/migrations/move-questions-to-question-table');
require('./db/migrations/generate-question-maps');

// const OKCupid = require('./lib/client.js');
// const rx = require('rxjs');

// const okc = new OKCupid('master_of_robots', '8cw67pknfgc');

// const loginStream = rx.Observable.fromPromise(okc.login());


// const baseQuery = {
//   order_by: 'SPECIAL_BLEND',
//   i_want: 'women',
//   they_want: 'men',
//   minimum_age: 18,
//   maximum_age: 30,
//   radius: 100,
//   bodytype: ['fit'],
//   maximum_attractiveness: 10000,
//   minimum_attractiveness: 6000,
//   speaks_my_language: true,
//   availability: 'single',
//   monogamy: 'yes',
//   last_login: 31557600 * 2,
//   limit: 1000, // max number of results
// };


// loginStream.subscribe(() => {
//   const query = Object.assign({}, baseQuery);
//   okc.paginatedSearch(query);
// }, (err) => {
//   console.log(err);
// });

