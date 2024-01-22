const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router.use(authController.protected);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protected,
    authController.restrictedTo('user'),
    reviewController.getUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictedTo('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(
    authController.restrictedTo('user', 'admin'),
    reviewController.updateReview,
  );

module.exports = router;
