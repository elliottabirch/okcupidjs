const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
    author: Number,
    staff: Number,
    submits: Number,
    genre: Number,
    lang_code: String,
    language: Number,
    qans1: String,
    qans2: String,
    qans3: String,
    qans4: String,
    qid: Number,
    qtext: String,
    raciness: Number,
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    adjustment: Number,
    autoscore: Number,
    axes: [{
      answer: Number,
      axis: Number,
      points: Number,
    }],
    noskip: Number,
    score: Number,
    status: Number,
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

module.exports = mongoose.model('User', UserSchema);
