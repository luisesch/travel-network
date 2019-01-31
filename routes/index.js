const express = require("express");
const router = express.Router();

const Travel = require("../models/travel");
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

let threeNewest;

/* GET home page */
router.get("/", (req, res, next) => {
  Travel.find()
    .sort("-createdAt")
    .exec(function(err, travels) {
      threeNewest = travels.slice(0, 3);
      res.render("index", {
        cities: cities,
        categories: categories,
        threeNewest: threeNewest
      });
    });
});

module.exports = router;
