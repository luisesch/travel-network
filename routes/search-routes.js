const express = require("express");
const searchRoutes = express.Router();

const bodyParser = require("body-parser");
searchRoutes.use(bodyParser.urlencoded({ extended: true }));

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

// results.get('/results', (req, res) => {
//   res.render('results', { cities: cities, categories: categories });
// });

searchRoutes.post("/results", (req, res) => {
  const start = req.body.start;
  const category = req.body.category;

  if (start && category) {
    query = { start: start, category: category }
  } else if (start) {
    query = { start: start }
  } else if (category) {
    query = { category: category }
  } else {
    query = {}
  }
  console.log('query', query)


  Travel.find(query)
    .then(travels => {
      res.render("search/results", { travels });
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = searchRoutes;
