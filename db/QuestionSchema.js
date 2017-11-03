const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
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
  qid: { type: Number, required: true, unique: true },
  qtext: String,
  raciness: Number,
});

module.exports = mongoose.model('Question', QuestionSchema);
