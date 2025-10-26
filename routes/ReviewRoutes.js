const express = require("express");
const auth = require("./../controllers/authController");
const cont = require("./../controllers/reviewController");
const router = express.Router({ mergeParams: true });
router.use(auth.protect);
router
  .route("/")
  .get(cont.getAllReviews)
  .post(auth.restrictTo("user"), cont.setTourUserId, cont.createReview);

router
  .route("/:id")
  .get(cont.getReview)
  .patch(auth.restrictTo("user", "admin"), cont.updateReview)
  .delete(auth.restrictTo("user", "admin"), cont.deleteReview);
module.exports = router;
