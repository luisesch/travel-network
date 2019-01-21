const express = require("express");
const travelRoutes = express.Router();
const passport = require("passport");

const ensureLogin = require("connect-ensure-login");

// User and travel model
const User = require("../models/user");
const Travel = require("../models/travel");
const uploadCloud = require("../config/cloudinary.js");

const cities = ["Berlin", "Hamburg", "Köln", "München"];
const categories = [
  "Travel with kids",
  "Panorama",
  "Train",
  "Bike",
  "Ship",
  "Hiking",
  "Sea",
  "City Trip",
  "Pilgrimage"
];

//add new experience

//render page with form to add new travel
travelRoutes.get(
  "/travel/add",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    res.render("travel/add", { cities: cities, categories: categories });
  }
);

//get data from form, create new travel and add to database
travelRoutes.post(
  "/travel/add",
  uploadCloud.array("photos"), //upload multiple files
  (req, res, next) => {
    //get url of each file and push to new array
    let urlArray = [];
    req.files.forEach(file => {
      urlArray.push(file.url);
      return;
    });

    const { title, category, start, description } = req.body;

    if (category == null) {
      res.render("travel/add", {
        cities: cities,
        categories: categories,
        message: "Choose at least one category."
      });
      return;
    }

    const newTravel = new Travel({
      photos: urlArray,
      Category: category,
      title: title,
      Description: description,
      Start: start
    });
    newTravel
      .save()
      .then(travel => {
        res.redirect("/profile");
      })
      .catch(error => {
        console.log(error);
      });
  }
);

// show selected experience

//find experience by id and render page
travelRoutes.get(
  "/travel/:travelId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    Travel.findById(req.params.travelId)
      .then(travel => {
        //necessary for the carousel (first item of array needs to be rendered individually)
        const photoArray = travel.photos.slice(1);
        res.render("travel/singleview", { travel, photoArray });
      })
      .catch(err => {
        console.log(err);
      });
  }
);

module.exports = travelRoutes;
