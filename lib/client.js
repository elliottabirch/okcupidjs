const constants = require('../custom_modules/constants');
const headers = require('../custom_modules/headers');
const Requester = require('./requester');

const URLS = constants.URLS;

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
    this.getUserQuestions = this.getUserQuestions.bind(this);
    this.getVisitors = this.getVisitors.bind(this);
    this.search = this.search.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.rate = this.getVisitors.bind(this);
  }

  login(username, password, callback) {
    const loginForm = {
      okc_api: 1,
      username,
      password,
    };
    this.requester.postRequest(URLS.login, loginForm, (err, res, body) => {
      // if there is a non-zero status in response and response does not show an error
      if (!err && body.status !== 0) {
        err = {
          status: body.status, // a status number
          status_str: body.status_str, // descriptive error message
        };

      // set the OAuth token in the custom header
      } else if (body.oauth_accesstoken) {
        headers.setOAuthToken(body.oauth_accesstoken);
      }
      callback(err, res, body);
    });
  }

  visitUser(username, callback) {
    const userProfileUrl = URLS.visit_user.replace('{username}', username);
    this.requester.getRequest(userProfileUrl, callback);
  }

  like(targetUserId, callback) {
    const likeUrl = URLS.like.replace('{userid}', targetUserId);
    this.requester.postRequest(likeUrl, {}, callback);
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

  getUserProfile(username, callback) {
    const userProfileUrl = URLS.user_profile.replace('{username}', username);
    this.requester.getRequest(userProfileUrl, callback);
  }

  getUserQuestions(username, low, callback) {
    const userQuestionsUrl = URLS.user_questions.replace('{username}', username).replace('{low}', low);
    this.requester.getRequest(userQuestionsUrl, callback);
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

  search(options, callback) {
    this.requester.postJsonRequest(URLS.search, options, callback);
  }
}
module.exports = OKCupid;
