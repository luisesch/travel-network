const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const travelSchema = new Schema({
  title: String,
  photos: [{ type: String, default: "/images/default_travel.png" }],
  description: String,
  start: String,
  category: [String]
});

const Travel = mongoose.model("Travel", travelSchema);

module.exports = Travel;
