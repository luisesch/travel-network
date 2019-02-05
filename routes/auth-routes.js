const express = require("express");
const authRoutes = express.Router();
const passport = require("passport");

const ensureLogin = require("connect-ensure-login");

// User and travel model
const User = require("../models/user");
const Travel = require("../models/travel");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

//signup

//render page with signup form
authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

//get information from signup form and create new user
authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  //check, if Username already exists
  User.findOne({ username })
    .then(user => {
      if (user !== null) {
        res.render("auth/signup", { message: "The username already exists" });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass
      });

      //save user to database and redirect to home page
      newUser.save(err => {
        if (err) {
          res.render("auth/signup", { message: "Something went wrong" });
        } else {
          // res.redirect("/");
          req.login(newUser, () => {
            res.redirect("/profile");
          });
        }
      });
    })
    .catch(error => {
      next(error);
    });
});

//login

//render login page and send error message, if password or username is wrong
authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login", { message: req.flash("error") });
});

authRoutes.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

//login with Google

authRoutes.get("/auth/google", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
}));

authRoutes.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/",
  successRedirect: "/profile/"
}));



//logout and redirect to login page
authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = authRoutes;
