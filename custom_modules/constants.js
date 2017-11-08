const _ = require('lodash');

const locations = {
  'El Paso': '79936',
  'Chicago IL':	'60629',
  'Los Angeles': '90011',
  Norwalk: '90650',
  'Bell Gardens': '90201',
  Houston: '77084',
  Fontana: '92335',
  Brownsville: '78521',
  Katy: '77449',
  Mission: '78572',
  Hawthorne: '90250',
  'South Gate': '90280',
  'Brooklyn NY':	'11226',
  'Long Beach': '90805',
  'Pacoima CA':	'91331',
  Lakewood: '08701',
  'San Juan PR':	'00926',
  Pittsburg: '94565',
  'Bronx NY':	'10467',
  Westminster: '92683',
  'Grand Prairie': '75052',
  'Sylmar CA':	'91342',
  'Santa Ana': '92704',
  Lawrenceville: '30044',
  'New York NY':	'10025',
  Riverside: '92503',
  Anaheim: '92804',
  Pharr: '78577',
  Dallas: '75217',
  Rialto: '92376',
  Bakersfield: '93307',
  'New York': '10002',
  'Chula Vista': '91911',
  'La Puente CA':	'91744',
  Mckinney: '75070',
  Fresno: '93722',
  Hesperia: '92345',
  'Oxnard CA':	'93033',
  Palmdale: '93550',
  'Watsonville CA':	'95076',
  'Corona NY':	'11368',
  Antioch: '37013',
  'Elmhurst NY':	'11373',
  Nashville: '37211',
  'Lawrenceville GA':	'30043',
  Bronx: '10453',
  'San Diego CA':	'92154',
  'Flushing NY':	'11355',
  Sacramento: '95823',
  'Sugar Land': '77479',
  'Baldwin Park': '91706',
  'Moreno Valley': '92553',
  Bellflower: '90706',
  'Virginia Beach': '23464',
  'Chino Hills': '91709',
  Woodbridge: '22193',
  Cypress: '77429',
  Lancaster: '93535',
  Olathe: '66062',
  Porterville: '93257',
  Atlanta: '30349',
  Pearland: '77584',
  'League City': '77573',
  'Woodside NY':	'11377',
  Charlotte: '28269',
  Hayward: '94544',
  'Las Vegas': '89110',
  'Riverside CA':	'92509',
  Reseda: '91335',
  'Yuma AZ':	'85364',
  'Albuquerque NM':	'87121',
  'Huntington Park CA':	'90255',
  'Simi Valley': '93065',
  'Chino CA':	'91710',
};

module.exports = {
  bodyTypes: [
    'skinny',
    'fit',
    'average',
    'jacked',
  ],
  locations,
  locationNames: _.keys(locations),
  URLS: {
    login: 'https://www.okcupid.com/login',
    rate: 'http://www.okcupid.com/quickmatch',
    visit_user: 'http://www.okcupid.com/profile/{username}',
    user_profile: 'http://www.okcupid.com/profile/{username}?okc_api=1',
    user_questions: 'http://www.okcupid.com/profile/{username}/questions?okc_api=1&low={low}',
    get_visitors: 'http://www.okcupid.com/visitors?okc_api=1',
    quickmatch: 'http://www.okcupid.com/quickmatch?okc_api=1',
    get_messages: 'https://www.okcupid.com/messages?okc_api=1',
    get_thread: 'https://www.okcupid.com/messages?okc_api=1&readmsg=true&threadid={thread_id}',

    // OAuth API
    get_location: 'https://www.okcupid.com/1/apitun/location/query?q={zip}',
    like: 'https://www.okcupid.com/1/apitun/profile/{userid}/like',
    unlike: 'https://www.okcupid.com/1/apitun/profile/{userid}/unlike',
    send_message: 'https://www.okcupid.com/1/apitun/messages/send',
    search: 'https://www.okcupid.com/1/apitun/match/search',
  },
};
