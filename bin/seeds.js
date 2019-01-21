const mongoose = require("mongoose");
const Travel = require("../models/travel");

const dbName = "travel-network";
mongoose.connect(`mongodb://localhost/${dbName}`);

const travels = [
  {
    title: "Schlittenfahren in Canada",
    photos: ["/images/experiences_train.jpeg", "/images/hiking.jpg"],
    Description:
      "Ich bin das erste Mal in meinem Leben Hundeschlitten gefahren - das war großartig",
    Start: "München",
    Category: "train"
  },
  {
    title: "Kühe melken in Brandenburg",
    photos: "/images/experiences_train.jpeg",
    Description: "Mit Zug und Fahrrad nach Brodowin- das Gute kann so nah sein",
    Start: "Berlin",
    Category: "bike"
  },
  {
    title: "Klettern in Sachsen",
    photos: "/images/experiences_train.jpeg",
    Description:
      "Tolle Aussicht im Elbsandsteingebirge und Knödel in Tschechien sind einfach yammi",
    Start: "Dresden",
    Category: "train"
  }
];

Travel.create(travels);
