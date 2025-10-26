const express = require("express");
const tourController = require("./../controllers/ToursController");
const auth = require("./../controllers/authController");
const rev = require("./../controllers/reviewController");
const reviewRouter = require("./../routes/ReviewRoutes");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);
// router.param('id', tourController.checkId);
router.route("/top-5-cheap").get(tourController.alias, tourController.getTours);
router.route("/get-stats").get(tourController.getToursStats);
router
  .route("/monthlyplan/:year")
  .get(
    auth.protect,
    auth.restrictTo("admin", "lead-guide", "guide"),
    tourController.monthlystats
  );
router
  .route("/")
  .get(tourController.getTours)
  .post(
    auth.protect,
    auth.restrictTo("admin", "lead-guide"),
    tourController.createTours
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    auth.protect,
    auth.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    auth.protect,
    auth.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  ); //.put,.patch,.delete()

// router
//   .route("/:tourId/reviews")
//   .post(auth.protect, auth.restrictTo("user"), rev.createReview);

module.exports = router;
