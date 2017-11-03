const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LogSchema = new Schema({
  action: String,
  data: Schema.Types.Mixed,
});

module.exports = mongoose.model('Log', LogSchema);
