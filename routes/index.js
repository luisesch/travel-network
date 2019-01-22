const express = require("express");
const router = express.Router();

const cities = ["Berlin", "Hamburg", "Köln", "München"];
const categories = [
  "travel with kids",
  "panorama",
  "train",
  "bike",
  "ship",
  "hiking",
  "sea",
  "city trip",
  "pilgrimage"
];

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", { cities: cities, categories: categories });
});

module.exports = router;
