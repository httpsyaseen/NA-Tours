const express = require('express');
const router = express.Router();
const tourController = require('./../controllers/tourController');
const authControlller = require('./../controllers/authController');

router
  .route('/')
  .get(authControlller.protected, tourController.getAllTours)
  .post(tourController.postTour);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/tour-monthlyplan/:year').get(tourController.getMonthlyPLan);

router
  .route('/:id')
  .get(tourController.getTourbyId)
  .patch(tourController.updateTourbyId)
  .delete(
    authControlller.protected,
    authControlller.restrictedTo('admin', 'lead-guide'),
    tourController.deleteTourbyId,
  );

module.exports = router;
