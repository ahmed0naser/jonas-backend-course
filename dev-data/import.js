const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DB_PASSWORD
).replace('<db_username>', process.env.DB_USERNAME);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    const res = await Tour.deleteMany();
    console.log(`Data successfully deleted! (${res.deletedCount} docs)`);
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
