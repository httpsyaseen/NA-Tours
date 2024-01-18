const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/').get(userController.getUser);
router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/resetpassword/:token').patch(authController.resetPassword);
router
  .route('/updateme')
  .patch(authController.protected, userController.updateMe);
router
  .route('/updatepassword')
  .patch(authController.protected, authController.updatePassword);
module.exports = router;
