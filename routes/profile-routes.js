const express = require("express");
const profileRoutes = express.Router();
const passport = require("passport");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

const ensureLogin = require("connect-ensure-login");

// User and travel model
const User = require("../models/user");
const Travel = require("../models/travel");
const uploadCloud = require("../config/cloudinary.js");

//render profile page (only if logged in)
profileRoutes.get("/profile", ensureLogin.ensureLoggedIn(), (req, res) => {
  //get travels user has created and render first three to profile page
  const travels = req.user.travels;
  const firstThree = travels.slice(0, 3);
  //get all travels from database (for now) and render to profile page (will need to be edited later, so that it renders the favorites of that individual user)
  Travel.find()
    .then(travels => {
      const firstThreeFavorites = travels.slice(0, 3);
      res.render("user/profile", {
        user: req.user,
        travels: firstThree,
        favorites: firstThreeFavorites
      });
    })
    .catch(error => {
      console.log(error);
    });
});

//edit

//find user to be edited and open edit form page
profileRoutes.get(
  "/profile/:userId/edit",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    User.findOne({ _id: req.params.userId })
      .then(document => {
        res.render("user/edit", { user: document });
      })
      .catch(error => {
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
    .catch(error => {
      console.log(error);
    });
});

//send new photo to cloudinary, update db and redirect to updated profile
profileRoutes.post(
  "/profile/:userId/editpicture",
  uploadCloud.single("profilepic"),
  (req, res, next) => {
    const profilepic = req.file.url;

    User.update({ _id: req.params.userId }, { $set: { photo: profilepic } })
      .then(() => {
        res.redirect("/profile");
      })
      .catch(error => {
        console.log(error);
      });
  }
);

module.exports = profileRoutes;
