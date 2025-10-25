const express = require("express");
const auth = require("./../controllers/authController");
const cont = require("./../controllers/reviewController");
const router = express.Router();

router
  .route("/")
  .get(cont.getAllReviews)
  .post(auth.protect, auth.restrictTo("user"), cont.createReview);

module.exports = router;
