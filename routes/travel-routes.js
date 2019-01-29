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
    let heart = "";
    //check, if travel is liked by user
    Like.count({
      userId: req.user._id,
      travelId: req.params.travelId
    })
      //if so, heart equals filled heart
      .then(count => {
        if (count > 0) {
          //if it exists, delete like/unlike
          // console.log("delete like");
          heart = "/images/heart_filled.png";
          console.log(heart);
        } else {
          //if not, heart equals unfilled heart
          heart = "/images/heart.png";
          console.log(heart);
        }
      })
      .then(() => {
        Travel.findById(req.params.travelId).then(travel => {
          //necessary for the carousel (first item of array needs to be rendered individually)
          const photoArray = travel.photos.slice(1);
          res.render("travel/singleview", { travel, photoArray, heart });
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
);

//edit existing travel/experience

travelRoutes.get(
  "/travel/edit/:travelId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    Travel.findById(req.params.travelId)
      .then(travel => {
        res.render("travel/travel-edit", {
          travel: travel,
          cities: cities,
          categories: categories
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
);

//update the edited travel in the database
travelRoutes.post(
  "/travel/edit/:travelId",
  uploadCloud.array("photos"),
  (req, res, next) => {
    const { title, description, start, category } = req.body;
    const travid = req.params.travelId;
    let currentPhotos = [];

    if (category == null) {
      res.render("travel/travel-edit", {
        cities: cities,
        categories: categories,
        message: "Choose at least one category."
      });
      return;
    }

    //create one array with existing and new photos
    Travel.findById(travid).then(travel => {
      currentPhotos.push(travel.photos);
    });
    req.files.forEach(file => {
      currentPhotos.push(file.url);
    });

    Travel.update(
      { _id: req.params.travelId },
      {
        $set: {
          title: title,
          description: description,
          start: start,
          category: category,
          photos: currentPhotos
        }
      }
    )
      .then(travel => {
        res.redirect("/travel/" + travid);
      })
      .catch(error => {
        console.log(error);
      });
  }
);

//delete photo on edit form
travelRoutes.get(
  "/photo/delete/*",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    const photoUrl = req.params[0];
    Travel.findOneAndUpdate(
      { photos: photoUrl },
      { $pull: { photos: photoUrl } }
    )
      .then(travel => {
        res.redirect("/travel/edit/" + travel._id);
      })
      .catch(error => console.log(error));
  }
);

//delete a travel from 'your travels'
travelRoutes.get("/travel/delete/:travelId", (req, res, next) => {
  Travel.findByIdAndRemove(req.params.travelId)
    .then(travel => {
      res.redirect("/profile");
    })
    .catch(error => {
      console.log(error);
    });
});

//like

travelRoutes.post(
  "/like/:travelId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    //check, if like already exists
    Like.count({
      userId: req.user._id,
      travelId: req.params.travelId
    }).then(count => {
      if (count > 0) {
        //if it exists, delete like/unlike
        // console.log("delete like");
        Like.findOneAndDelete({
          userId: req.user._id,
          travelId: req.params.travelId
        }).then(() => res.redirect("/travel/" + req.params.travelId));
      } else {
        //if it doesn't exist, create new like
        // console.log("add like");
        const newLike = new Like({
          userId: req.user._id,
          travelId: req.params.travelId
        });
        //save like to database and redirect to travel page
        newLike
          .save()
          .then(() => {
            res.redirect("/travel/" + req.params.travelId);
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  }
);


module.exports = travelRoutes;
