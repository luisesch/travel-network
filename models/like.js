const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  travelId: { type: Schema.Types.ObjectId, ref: "Travel" }
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
