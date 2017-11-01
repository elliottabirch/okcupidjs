const OKCupid = require('./lib/client.js');
const rx = require('rxjs');
const mongoose = require('mongoose');
const async = require('async');

const Schema = mongoose.Schema;

const mongoUri = 'mongodb://localhost:27017/okc';

mongoose.connect(mongoUri);
mongoose.connection.on('error', (err) => {
  console.log(err);
});
mongoose.connection.once('open', () => {
  console.log(`Connected to ${mongoUri}`);
});


const UserSchema = new Schema({
  adjectives: Schema.Types.Array,
  age: Number,
  curr_score: Number,
  distance: Number,
  enemy_perc: Number,
  enemypercentage: Number,
  essays: Array,
  essays2: Array,
  friendpercentage: Number,
  gender: Number,
  gender_str: String,
  is_buddy: Boolean,
  is_online: String,
  last_login: Number,
  location: String,
  lquery: String,
  matchpercentage: Number,
  orientation: Number,
  orientation_str: String,
  photos: Array,
  rawstatus: Number,
  searchprefs: Schema.Types.Mixed,
  skinny: Schema.Types.Mixed,
  status: Number,
  status_str: String,
  thumbnail: String,
  thumbnail_100: String,
  thumbnail_60: String,
  units: String,
  userid: { type: String, unique: true, index: true },
  username: { type: String, index: true },
  viewer_is_staff: Number,
  questions: [{
    adjustment: Number,
    author: Number,
    autoscore: Number,
    axes: [{
      answer: Number,
      axis: Number,
      points: Number,
    }],
    genre: Number,
    lang_code: String,
    language: Number,
    noskip: Number,
    qans1: String,
    qans2: String,
    qans3: String,
    qans4: String,
    qid: Number,
    qtext: String,
    raciness: Number,
    score: Number,
    staff: Number,
    status: Number,
    submits: Number,
    target: {
      answer: Number,
      date_answered: Number,
      importance: Number,
      is_public: Number,
      match_answers: Number,
      skipped: Number,
      TARGET_ACCEPTS: Number,
    },
    username: String,
    viewer: {
      answer: Number,
      date_answered: Number,
      importance: Number,
      is_public: Number,
      match_answers: Number,
      skipped: Number,
      TARGET_ACCEPTS: Number,
    },
  }],
});

const User = mongoose.model('User', UserSchema);


module.exports = OKCupid;

const okc = new OKCupid();

const loginStream = rx.Observable.bindNodeCallback(okc.login)('master_of_robots', '8cw67pknfgc');


function search(_okc, query, count) {
  _okc.search(query, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    // print out usernames
    async.eachLimit(body.data, 1, (okcUser, eCb) => {
      _okc.getUserProfile(okcUser.username, (err, res, detailedUser) => {
        if (err) {
          return eCb(err);
        }
        if (detailedUser.status !== 1) {
          console.log(`bad status for ${okcUser}`);
          return eCb();
        }
        User.findOne({ username: detailedUser.username }, (err, foundUser) => {
          if (err) {
            eCb(err);
          } else if (!foundUser) {
            _okc.getUserQuestions(detailedUser.username, 1, (err, uqres, uqBody) => {
              if (uqBody.pagination.last < 50) {
                console.log('user doesnt have enough questions, skipping');
                return eCb();
              }
              const user = Object.assign({}, detailedUser);
              _okc.like(detailedUser.userid);
              user.questions = user.questions || [];
              user.questions = user.questions.concat(uqBody.question_data);
              async.timesLimit(Math.floor(uqBody.pagination.last / 10), 10, (n, tCb) => {
                _okc.getUserQuestions(detailedUser.username, 1 + (10 * (n + 1)), (err, iuqRes, iuqBody) => {
                  if (err) {
                    tCb(err);
                  } else {
                    user.questions = user.questions.concat(iuqBody.question_data);
                    tCb();
                  }
                });
              }, (err) => {
                if (err) {
                  eCb(err);
                } else {
                  User.create(user, (err, savedUser) => {
                    if (err) {
                      eCb(err);
                    } else {
                      console.log(`saved new user${savedUser._id}`);
                      eCb();
                    }
                  });
                }
              });
            });
          } else {
            console.log('user already exists');
            eCb();
          }
        });
      });
    }, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log('done');
    });
  });
}

loginStream.subscribe((res) => {
  const query = {
    order_by: 'SPECIAL_BLEND',
    i_want: 'women',
    they_want: 'men',
    minimum_age: 18,
    maximum_age: 30,
    radius: 25,
    minimum_attractiveness: 8000,
    maximum_attractiveness: 10000,
    bodytype: ['skinny', 'fit', 'average', 'jacked'],
    speaks_my_language: true,
    availability: 'single',
    monogamy: 'yes',
    last_login: 31557600 * 5,
    limit: 1000, // max number of results
  };
  search(okc, query, 0);
}, (err) => {
  console.log(err);
});

