const express = require("express");
const router = express.Router();

const cities = ["Berlin", "Hamburg", "Köln", "München"];
const categories = [
  "Travel with kids",
  "Panorama",
  "train",
  "Bike",
  "Ship",
  "Hiking",
  "Sea",
  "City Trip",
  "Pilgrimage"
];

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", { cities: cities, categories: categories });
});

module.exports = router;
