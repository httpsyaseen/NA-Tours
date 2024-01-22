const express = require('express');
const router = express.Router();
const tourController = require('./../controllers/tourController');
const authControlller = require('./../controllers/authController');
const reviewRouter = require('./reviewRouter');

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authControlller.protected,
    authControlller.restrictedTo('admin', 'lead-guide'),
    tourController.postTour,
  );

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/tour-monthlyplan/:year')
  .get(
    authControlller.protected,
    authControlller.restrictedTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPLan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/:id')
  .get(tourController.getTourbyId)
  .patch(tourController.updateTourbyId)
  .delete(
    authControlller.protected,
    authControlller.restrictedTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
