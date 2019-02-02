const mongoose = require("mongoose");
const Travel = require("../models/travel");

const dbName = "travel-network";
mongoose.connect(`mongodb://localhost/${dbName}`);

const travels = [
  {
    title: "Schlittenfahren in Canada",
    photos: ["/images/experiences_train.jpeg", "/images/hiking.jpg"],
    description:
      "Ich bin das erste Mal in meinem Leben Hundeschlitten gefahren - das war großartig",
    start: "München",
    category: "train"
  },
  {
    title: "Kühe melken in Brandenburg",
    photos: "/images/experiences_train.jpeg",
    description: "Mit Zug und Fahrrad nach Brodowin- das Gute kann so nah sein",
    start: "Berlin",
    category: "city trip"
  },
  {
    title: "Klettern in Sachsen",
    photos: "/images/experiences_train.jpeg",
    description:
      "Tolle Aussicht im Elbsandsteingebirge und Knödel in Tschechien sind einfach yammi",
    start: "Hamburg",
    category: "train"
  }
];

Travel.create(travels);
