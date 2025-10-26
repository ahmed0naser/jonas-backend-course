const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("./../models/tourModel");
const User = require("./../models/userModel");
const Review = require("./../models/reviewModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DB_PASSWORD
).replace("<db_username>", process.env.DB_USERNAME);

mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, "utf-8")
);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {
      validateBeforeSave: false,
    });
    await Review.create(reviews);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log(`Data successfully deleted! `);
  } catch (err) {
    console.log(err);
  }
};

const run = async () => {
  await deleteData();
  await importData();
  process.exit();
};

run();
