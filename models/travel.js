const mongoose = require('mongoose')
const Schema   = mongoose.Schema;

const travelSchema = new Schema({
  title: String,
  photos: [String],
  Description: String,
  Start: String,
  Category: [String]
})

const Travel = mongoose.model('Travel', travelSchema)

module.exports = Travel