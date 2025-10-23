const express = require('express');
const tourController = require('./../controllers/ToursController');
const auth = require('./../controllers/authController');

const router = express.Router();
// router.param('id', tourController.checkId);
router.route('/top-5-cheap').get(tourController.alias, tourController.getTours);
router.route('/get-stats').get(tourController.getToursStats);
router.route('/monthlyplan/:year').get(tourController.monthlystats);
router
  .route('/')
  .get(auth.protect, tourController.getTours)
  .post(tourController.createTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  ); //.put,.patch,.delete()

module.exports = router;
