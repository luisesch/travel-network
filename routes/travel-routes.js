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

travelRoutes.get(
  "/travel/add",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    console.log("render travel/add");
    res.render("travel/add", { cities: cities, categories: categories });
  }
);

module.exports = travelRoutes;
