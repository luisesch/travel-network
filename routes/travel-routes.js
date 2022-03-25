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
  "travel with kids",
  "panorama",
  "train",
  "bike",
  "ship",
  "hiking",
  "sea",
  "city trip",
  "pilgrimage",
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
  ensureLogin.ensureLoggedIn(),
  uploadCloud.array("photos"), //upload multiple files
  (req, res, next) => {
    let urlArray = [];
    //if no photo has been added, use default picture, else get url of each file and push to new array
    if (req.files == "") {
      urlArray.push("/images/default_travel.png");
    } else {
      req.files.forEach((file) => {
        // hack to add a "a_exif" at the right point in the URL
        let nonRotatedUrlArr = file.path.split("/");
        nonRotatedUrlArr.splice(6, 0, "a_exif");
        urlArray.push(nonRotatedUrlArr.join("/"));
      });
    }

    const { title, category, start, description } = req.body;

    if (category == null) {
      res.render("travel/add", {
        cities: cities,
        categories: categories,
        message: "Choose at least one category.",
      });
      return;
    }

    const newTravel = new Travel({
      photos: urlArray,
      category: category,
      title: title,
      description: description,
      start: start,
    });

    //push id of new travel to user who created it (to travels array) and open travel page
    newTravel.save().then((travel) => {
      const travelId = travel._id;
      User.update({ _id: req.user._id }, { $push: { travels: travelId } })
        .then(() => {
          res.redirect("/travel/" + travelId);
        })
        .catch((error) => {
          console.log(error);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
);

// show selected experience

//edit existing travel/experience

travelRoutes.get(
  "/travel/edit/:travelId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    Travel.findById(req.params.travelId)
      .then((travel) => {
        res.render("travel/travel-edit", {
          travel: travel,
          cities: cities,
          categories: categories,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
);

//update the edited travel in the database
travelRoutes.post(
  "/travel/edit/:travelId",
  ensureLogin.ensureLoggedIn(),
  uploadCloud.array("photos"),
  (req, res, next) => {
    const { title, description, start, category } = req.body;
    const travid = req.params.travelId;
    let currentPhotos = [];

    if (category == null) {
      Travel.findById(travid).then((travel) => {
        res.render("travel/travel-edit", {
          travel: travel,
          cities: cities,
          categories: categories,
          message: "Choose at least one category.",
        });
      });
      return;
    }

    //create an array with new photos
    req.files.forEach((file) => {
      currentPhotos.push(file.url);
    });

    Travel.update(
      { _id: req.params.travelId },
      {
        $push: { photos: currentPhotos },
        $set: {
          title: title,
          description: description,
          start: start,
          category: category,
        },
      }
    )
      .then((travel) => {
        res.redirect("/travel/" + travid);
      })
      .catch((error) => {
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
      .then((travel) => {
        res.redirect("/travel/edit/" + travel._id);
      })
      .catch((error) => console.log(error));
  }
);

//delete a travel from 'your travels'
travelRoutes.get(
  "/travel/delete/:travelId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    Travel.findByIdAndRemove(req.params.travelId)
      .then((travel) => {
        Like.deleteMany({
          travelId: req.params.travelId,
        })
          .then(() => res.redirect("/profile"))
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }
);

//like

travelRoutes.post(
  "/like/:travelId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    //get current url
    const backUrl = req.header("Referer");

    //check, if like already exists
    Like.count({
      userId: req.user._id,
      travelId: req.params.travelId,
    }).then((count) => {
      if (count > 0) {
        //if it exists, delete like/unlike
        // console.log("delete like");
        Like.findOneAndDelete({
          userId: req.user._id,
          travelId: req.params.travelId,
        }).then(() => res.redirect(backUrl));
      } else {
        //if it doesn't exist, create new like
        // console.log("add like");
        const newLike = new Like({
          userId: req.user._id,
          travelId: req.params.travelId,
        });
        //save like to database and redirect to travel page
        newLike
          .save()
          .then(() => {
            res.redirect("/travel/" + req.params.travelId);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }
);

// See the collection of all trips (of all users)
travelRoutes.get("/travel/alltrips", (req, res, next) => {
  Travel.find()
    .sort("-createdAt")
    .exec(function (
      err,
      travels // .then(travels =>
    ) {
      res.render("travel/alltrips", { travels: travels });
    });
});

//find experience by id and render page
travelRoutes.get(
  "/travel/:travelId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    let heart = "";
    //check, if travel is liked by user
    Like.count({
      userId: req.user._id,
      travelId: req.params.travelId,
    })
      //if so, heart equals filled heart
      .then((count) => {
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
        Travel.findById(req.params.travelId).then((travel) => {
          let canEdit = "";
          // console.log(req.params.travelId);
          req.user.travels.forEach((object) => {
            if (object == req.params.travelId) {
              canEdit = true;
            }
          });
          //necessary for the carousel (first item of array needs to be rendered individually)
          const photoArray = travel.photos.slice(1);
          res.render("travel/singleview", {
            travel,
            photoArray,
            heart,
            canEdit,
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

module.exports = travelRoutes;

// profileRoutes.get(
//   '/profile/yourtravels',
//     ensureLogin.ensureLoggedIn(),
//     (req, res, next) => {
//       User.findOne({ _id: req.user._id })
//       .populate("travels")
//       .then(user => {
//         const travels = user.travels;
//         res.render("user/yourtravels", { travels: travels });
//       })

// });
