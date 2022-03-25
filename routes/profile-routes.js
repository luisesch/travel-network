const express = require("express");
const profileRoutes = express.Router();
const passport = require("passport");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

const ensureLogin = require("connect-ensure-login");

// User and travel model
const Like = require("../models/like");
const User = require("../models/user");
const Travel = require("../models/travel");
const uploadCloud = require("../config/cloudinary.js");

//render profile page (only if logged in)
profileRoutes.get("/profile", ensureLogin.ensureLoggedIn(), (req, res) => {
  //get travels user has created and get first three
  let firstThreeTravels = [];
  let firstThreeFavorites = [];

  User.findOne({ _id: req.user._id })
    .populate("travels")
    .then((user) => {
      const travels = user.travels;
      firstThreeTravels = travels.slice(0, 3);
      // console.log(firstThreeTravels);
    })
    .then(() => {
      //get first three favorites of user
      Like.find({ userId: req.user._id })
        .populate("travelId")
        .then((likes) => {
          firstThree = likes.slice(0, 3);
          firstThree.forEach((item) => firstThreeFavorites.push(item.travelId));
        })
        .then(() =>
          res.render("user/profile", {
            user: req.user,
            travels: firstThreeTravels,
            favorites: firstThreeFavorites,
          })
        )
        .catch((error) => {
          console.log(error);
        });
    });
});

//edit

//find user to be edited and open edit form page
profileRoutes.get(
  "/profile/:userId/edit",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    User.findOne({ _id: req.params.userId })
      .then((document) => {
        res.render("user/edit", { user: document });
      })
      .catch((error) => {
        console.log(error);
      });
  }
);

//get new password from editing form, update db and redirect to updated profile
profileRoutes.post("/profile/:userId/editpassword", (req, res, next) => {
  const password = req.body.password;
  const repeatPassword = req.body.passwordRepeat;

  //if the two password fields don't match, show error message
  if (password !== repeatPassword) {
    res.render("user/edit", { message: "Repeat your new password" });
    return;
  }

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  User.update({ _id: req.params.userId }, { $set: { password: hashPass } })
    .then(() => {
      res.redirect("/profile");
    })
    .catch((error) => {
      console.log(error);
    });
});

//send new photo to cloudinary, update db and redirect to updated profile
profileRoutes.post(
  "/profile/:userId/editpicture",
  uploadCloud.single("profilepic"),
  async (req, res) => {
    // hack to add a "a_exif" at the right point in the URL
    let nonRotatedUrlArr = req.file.path.split("/");
    nonRotatedUrlArr.splice(6, 0, "a_exif");
    profilepic = nonRotatedUrlArr.join("/");
    // console.log(profilepic);

    User.updateOne({ _id: req.params.userId }, { $set: { photo: profilepic } })
      .then(() => {
        console.log("test");
        res.redirect("/profile");
      })
      .catch((error) => {
        console.log(error);
      });
  }
);

// See all your travels you have created
profileRoutes.get(
  "/profile/yourtravels",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    User.findOne({ _id: req.user._id })
      .populate("travels")
      .then((user) => {
        const travels = user.travels;
        res.render("user/yourtravels", { travels: travels });
      });
  }
);

// See all your favorite trips
profileRoutes.get(
  "/profile/yourfavorites",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    Like.find({ userId: req.user._id })
      .populate("travelId")
      .then((likes) => {
        const favorites = likes.map((e) => e.travelId);
        res.render("user/yourfavorites", { favorites: favorites });
      });
  }
);

module.exports = profileRoutes;
