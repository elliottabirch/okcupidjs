const { URLS, bodyTypes } = require('../custom_modules/constants');
const Requester = require('./requester');
const { User, Question } = require('../db/index');
const rx = require('rxjs');
const AsyncCache = require('async-cache');
const fs = require('fs');
const log4js = require('log4js');


log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
  categories: { default: { appenders: ['cheese'], level: 'error' } },
});

const log = log4js.getLogger('cheese');

const logDataMap = (data) => {
  log.error(`new users: ${data.newUsersCreated}\n`);
  log.error(`lowquestions: ${data.lowquestions}\n`);
  log.error(`alreadyExists: ${data.alreadyExists}\n`);
  log.error(`newQuestionsCreated: ${data.newQuestionsCreated}\n`);
  log.error(`miscErrors: ${data.miscErrors}\n`);
  log.error('----------------------------\n');
};
let datamap = {
  lowquestions: 0,
  alreadyExists: 0,
  miscErrors: 0,
  newQuestionsCreated: 0,
  newUsersCreated: 0,
};

const hasError = (err, res, reject) => {
  if (err) { return !!reject(err); }
  if (res && res.statusCode !== 200) {
    return !!reject(new Error(`status code ${res.statusCode}: unknown error`));
  }
  return false;
};

const resetDataMap = () => {
  datamap = {
    lowquestions: 0,
    alreadyExists: 0,
    miscErrors: 0,
    newQuestionsCreated: 0,
    newUsersCreated: 0,
  };
};
class OKCupid {
  constructor(username, password) {
    this.requester = new Requester();
    this.username = username;
    this.password = password;
    this.login = this.login.bind(this);
    this.visitUser = this.visitUser.bind(this);
    this.like = this.like.bind(this);
    this.getMessageThread = this.getMessageThread.bind(this);
    this.getQuickmatch = this.getQuickmatch.bind(this);
    this.getRecentMessages = this.getRecentMessages.bind(this);
    this.getUserProfile = this.getUserProfile.bind(this);
    this.paginatedSearch = this.paginatedSearch.bind(this);
    this.getUserQuestions = this.getUserQuestions.bind(this);
    this.findQuestion = this.findQuestion.bind(this);
    this.getVisitors = this.getVisitors.bind(this);
    this.search = this.search.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.rate = this.getVisitors.bind(this);
    this.accessToken = '';
    this.questionCache = new AsyncCache({
      maxAge: 600000,
      load: (qid, cb) => Question.findOne(
        { qid }).exec(cb),
    });
  }

  login() {
    const loginForm = {
      okc_api: 1,
      username: this.username,
      password: this.password,
    };
    return new Promise((resolve, reject) => {
      this.requester.postRequest(URLS.login, loginForm, (err, res, body) => {
        if (!hasError(err, res, reject)) {
          if (body.status !== 0) {
            reject({
              status: body.status, // a status number
              status_str: body.status_str, // descriptive error message
            });
            return;
          }
          if (!body.oauth_accesstoken) {
            reject(new Error('No Access Token Given'));
            return;
          }
          this.requester.headers.setOAuthToken(body.oauth_accesstoken);
          this.accessToken = body.oauth_accesstoken;
          resolve(body);
        }
      });
    });
  }

  visitUser(username) {
    const userProfileUrl = URLS.visit_user.replace('{username}', username);
    return new Promise((resolve, reject) => {
      this.requester.getRequest(userProfileUrl, (err, res, body) => {
        if (!hasError(err, res, reject)) {
          resolve(body);
        }
      });
    });
  }

  like(targetUserId) {
    const likeUrl = URLS.visit_user.replace('{userid}', targetUserId);
    return new Promise((resolve, reject) => {
      this.requester.getRequest(likeUrl, (err, res, body) => {
        if (!hasError(err, res, reject)) {
          resolve(body);
        }
      });
    });
  }

  unlike(targetUserId, callback) {
    const unlikeUrl = URLS.unlike.replace('{userid}', targetUserId);
    this.requester.postRequest(unlikeUrl, {}, callback);
  }

  rate(targetUserId, score, callback) {
    const data = {
      okc_api: 1,
      score,
      vote_type: 'personality',
      targetUserId,
    };
    this.requester.postRequest(URLS.rate, data, callback);
  }

  getQuickmatch(callback) {
    this.requester.getRequest(URLS.quickmatch, callback);
  }

  getUserProfile(username) {
    const userProfileUrl = URLS.user_profile.replace('{username}', username);
    return new Promise((resolve, reject) => {
      this.requester.getRequest(userProfileUrl, (err, res, body) => {
        if (!hasError(err, res, reject)) {
          resolve(body);
        }
      });
    });
  }

  getUserQuestions(username, low) {
    const userQuestionsUrl = URLS.user_questions.replace('{username}', username).replace('{low}', low);
    return new Promise((resolve, reject) => {
      this.requester.getRequest(userQuestionsUrl, (err, res, body) => {
        if (!hasError(err, res, reject)) {
          resolve(body);
        }
      });
    });
  }

  getVisitors(callback) {
    this.requester.getRequest(URLS.get_visitors, callback);
  }

  sendMessage(userId, messageBody, callback) {
    this.requester.postJsonRequest(URLS.send_message, { body: messageBody, receiverid: userId }, callback);
  }

  getRecentMessages(callback) {
    this.requester.getRequest(URLS.get_messages, callback);
  }

  getMessageThread(threadId, callback) {
    const threadUrl = URLS.get_thread.replace('{threadId}', threadId);
    this.requester.getRequest(threadUrl, callback);
  }

  betterSearch(options) {
    if (options.location) {
      return this.getLocationFromZip(options.location)
        .then((location) => {
          const zipReplacedOptions = Object.assign(options, { location });
          return this.search(zipReplacedOptions);
        }).catch((err) => { log.error(err); });
    }
    return this.search(options);
  }

  search(options) {
    return new Promise((resolve, reject) => {
      this.requester.postJsonRequest(URLS.search, options, (err, res, body) => {
        if (!hasError(err, res, reject)) {
          this.log.error(`found ${body.data.length} search results`);
          datamap.newQuestionsCreated += 1;
          resolve(body);
        }
      });
    });
  }

  getLocationFromZip(zip) {
    const getLocationUrl = URLS.get_location.replace('{zip}', zip);
    return new Promise((resolve, reject) => {
      this.requester.getRequest(getLocationUrl, (err, res, body) => {
        if (!hasError(err, res, reject)) {
          resolve(body.results[0]);
        }
      });
    });
  }

  findDbUserByUsername(username) {
    return new Promise((resolve, reject) => {
      User.findOne({ username }, (err, foundUser) => {
        if (err) { return reject(err); }
        return resolve(foundUser);
      });
    });
  }

  createNewUser(user) {
    return new Promise((resolve, reject) => {
      User.create(user, (err, newUser) => {
        if (err) { return reject(err); }
        this.log.error(`created new user with ID ${newUser._id}`);
        datamap.newUsersCreated += 1;
        return resolve(newUser);
      });
    });
  }

  findQuestion(qid) {
    return new Promise((resolve, reject) => {
      this.questionCache.get(qid, (err, question) => {
        if (err) { return reject(err); }
        return resolve(question);
      });
    });
  }


  createNewQuestion({ author, staff, submits, genre, lang_code, language, qans1, qans2, qans3, qans4, qid, qtext, raciness }) {
    return new Promise((resolve, reject) => {
      Question.findOne({ qid }, (err, res) => {
        if (err) { return reject(err); }
        if (res) { return resolve(res); }
        Question.create({ author, staff, submits, genre, lang_code, language, qans1, qans2, qans3, qans4, qid, qtext, raciness }, (err, newUser) => {
          if (err) {
            return reject(err);
          }
          this.log.error(`created new questions with ID ${newUser.qid}`);
          datamap.newQuestionsCreated += 1;
          return resolve(newUser);
        });
      });
    });
  }

  paginatedSearch(query) {
    this.log = log;
    resetDataMap();

    rx.Observable.from(bodyTypes)
      .mergeMap((bodyType) => {
        query.bodytype = [bodyType];
        log.error('-----------starting--------------\n');
        log.error(`$${bodyType}\n`);
        log.error(`${JSON.stringify(query)}\n`);
        return rx.Observable
          .fromPromise(this.search(query))
          .map(body => rx.Observable.from(body.data))
          .mergeAll(1)
          .filter(user => !user.inactive || !user.staff || !user.isAdmin)
          .map(user =>
            rx.Observable
              .fromPromise(this.findDbUserByUsername(user.username))
              .do((dbUser) => { if (dbUser) { datamap.alreadyExists += 1; log.error(`user ${dbUser.username} already exists`); } })
              .skipWhile((db) => {
                console.log();
                return db;
              })
              .map(() => {
                console.log();
                return user;
              })
              .mergeMap(plainuser => rx.Observable.fromPromise(this.getUserProfile(plainuser.username))
                .do((user) => { if (user.status !== 1) { datamap.miscErrors += 1; log.error(`unable to find profile for user ${user.username}`); } })
                .skipWhile(user => user.status !== 1)
                .map(user =>
                  rx.Observable
                    .fromPromise(this.getUserQuestions(user.username, 1))
                    .map(body => [body, user]))
                .mergeAll(2)
                .do(([body, user]) => { if (body.pagination.last <= 0) { datamap.lowquestions += 1; log.error(`${user.username} only has ${body.pagination.last} messages, so skipping`); } })
                .filter(([body]) => body.pagination.last > 0)
                .map(([body, user]) => rx.Observable
                  .of(user)
                  .map(() => rx.Observable
                    .of(body)
                    .map(body => Math.floor(body.pagination.last / 10) + 1)
                    .map(timesToRepeat => rx.Observable
                      .range(0, timesToRepeat)
                      .map(index => (index * 10) + 1)
                      .mergeMap(low => rx.Observable
                        .fromPromise(this.getUserQuestions(user.username, low))
                        .retryWhen(errors => errors.delay(1000).take(10))
                        .map(questions => rx.Observable
                          .from(questions.question_data)
                          .map((question) => {
                            const { adjustment, autoscore, axes, noskip, score, status, target, username, viewer } = question;
                            return rx.Observable
                              .fromPromise(this.findQuestion(question.qid))
                              .map(dbQuestion => (!dbQuestion ? rx.Observable.fromPromise(this.createNewQuestion(question)) : rx.Observable.of(dbQuestion)))
                              .mergeAll()
                              .map(({ _id }) => ({ questionId: _id, adjustment, autoscore, axes, noskip, score, status, target, username, viewer }));
                          })
                          .mergeAll(1))
                        .mergeAll(1), null, 10))
                    .mergeAll(1))
                  .mergeAll()
                  .scan((allQuestions, formattedQuestion) => allQuestions.concat([formattedQuestion]), [])
                  .last()
                  .map(questions => questions)
                  .map(questions => Object.assign(user, { questions })))
                .mergeAll(5)
                .mergeMap(user => rx.Observable.fromPromise(this.createNewUser(user))), null, 1)
              .map(() => [bodyType]))
          .mergeAll(1)
          .retryWhen(errors => errors.delay(1000).take(10));
      }, null, 1)
      .subscribe((user) => { log.error(`finished user ${user.username}`); }, (err) => { log.error(err.stack); logDataMap(datamap); }, () => {
        logDataMap(datamap);
      });
  }
}
module.exports = OKCupid;
