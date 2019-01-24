const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema({
  userId: Schema.Types.ObjectId,
  travelId: Schema.Types.ObjectId
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
