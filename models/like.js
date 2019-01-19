const mongoose = require('mongoose')
const Schema   = mongoose.Schema;

const likeSchema = new Schema({
  userID: Schema.Types.ObjectId,
  travelID: Schema.Types.ObjectId
})

const Like = mongoose.model('Like', likeSchema)

module.exports = Like