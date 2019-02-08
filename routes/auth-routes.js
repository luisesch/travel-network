const express = require("express");
const authRoutes = express.Router();
const passport = require("passport");

const ensureLogin = require("connect-ensure-login");

// User and travel model
const User = require("../models/user");
const Travel = require("../models/travel");

const templates = require("../templates/template");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

//nodemailer
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

//signup

//render page with signup form
authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

//get information from signup form and create new user
authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let confirmationCode = "";
  for (let i = 0; i < 25; i++) {
    confirmationCode +=
      characters[Math.floor(Math.random() * characters.length)];
  }

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
        username: username,
        password: hashPass,
        email: email,
        confirmationCode: confirmationCode
      });

      //save user to database and redirect to home page
      newUser.save(err => {
        if (err) {
          res.render("auth/signup", { message: "Something went wrong" });
        } else {
          //nodemailer
          transporter
            .sendMail({
              from: '"Travel Network" <travel.network.ironhack@gmail.com>',
              to: email,
              subject: "Please verify your email address!",
              text: "http://localhost:3000/auth/confirm/" + confirmationCode,
              html: templates.templateExample(
                "http://localhost:3000/auth/confirm/" + confirmationCode
              )
            })
            .then(() => {
              req.login(newUser, () => {
                res.redirect("/auth/verification");
              });
            })
            .catch(error => {
              next(error);
            });
        }
      });
    })
    .catch(error => {
      next(error);
    });
});

authRoutes.get("/auth/verification", (req, res) => {
  res.render("auth/verificationinfo");
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

authRoutes.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/plus.profile.emails.read"
    ]
  })
);

authRoutes.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/profile/"
  })
);

//logout and redirect to login page
authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

//verify email address
authRoutes.get("/auth/confirm/:confirmCode", (req, res) => {
  confirmationCode = req.params.confirmCode;
  User.findOneAndUpdate(
    { confirmationCode: confirmationCode },
    { $set: { status: "Active" } }
  )
    .then(user => {
      req.login(user, () => {
        res.redirect("/auth/confirmation/" + user.username);
      });
    })
    .catch(err => console.log(err));
});

authRoutes.get("/auth/confirmation/:username", (req, res) => {
  res.render("auth/confirmation", { name: req.params.username });
});

module.exports = authRoutes;
