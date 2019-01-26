const express = require("express");
const travelRoutes = express.Router();
const passport = require("passport");

const ensureLogin = require("connect-ensure-login");

// User and travel model
const User = require("../models/user");
const Like = require("../models/like");
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
      category: category,
      title: title,
      description: description,
      start: start
    });

    //push id of new travel to user who created it (to travels array) and open travel page
    newTravel.save().then(travel => {
      const travelId = travel._id;
      User.update({ _id: req.user._id }, { $push: { travels: travelId } })
        .then(() => {
          res.redirect("/travel/" + travelId);
        })
        .catch(error => {
          console.log(error);
        })
        .catch(error => {
          console.log(error);
        });
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


//edit existing travel/experience

travelRoutes.get('/travel/edit/:travelId', (req, res, next) => {
  Travel.findById(req.params.travelId)
  .then((travel) => {
    console.log("INSIDE EDIT GET",travel);
    res.render("travel/travel-edit", {travel: travel, cities: cities, categories: categories});
  })
  .catch((error) => {
    console.log(error);
  })
});

//update the edited travel in the database
travelRoutes.post('/travel/edit/:travelId', (req, res, next) => {
  const { title, description, start, category } = req.body;
  const travid = req.params.travelId
  Travel.update({_id: req.params.travelId}, { $set: {title: title, description: description, start: start, category: category }})
  .then((travel) => {
   
    res.redirect('/travel/'+travid);
  })
  .catch((error) => {
    console.log(error);
  })
});

travelRoutes.post(
  "/like/:travelId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const newLike = new Like({
      userId: req.user._id,
      travelId: req.params.travelId
    });

    //save user to database and redirect to home page
    newLike
      .save()
      .then(() => {
        res.redirect("/travel/" + req.params.travelId);
      })
      .catch(error => {
        console.log(error);
      });
  }
);


module.exports = travelRoutes;
