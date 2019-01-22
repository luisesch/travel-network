const express = require("express");
const searchRoutes = express.Router();

const bodyParser = require('body-parser');
searchRoutes.use(bodyParser.urlencoded({ extended: true }));

const Travel = require("../models/travel");

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



// results.get('/results', (req, res) => {
//   res.render('results', { cities: cities, categories: categories });
// });

searchRoutes.post('/results', (req, res) => {
  const start    = req.body.start;
  const category = req.body.category;
  // res.send(`Start: ${start}`);
  Travel.find({'Start': start, 'Category': category})
    .then(travels => {
      res.render("search/results", {travels})
    })
    .catch(error => {
      console.log(error)
    })
});



module.exports = searchRoutes;