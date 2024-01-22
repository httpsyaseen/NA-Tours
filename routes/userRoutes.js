const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/resetpassword/:token').patch(authController.resetPassword);

router.use(authController.protected);

router.route('/updateme').patch(userController.updateMe);
router.route('/deleteme').patch(userController.deleteUser);
router.route('/updatepassword').patch(authController.updatePassword);
router.route('/me').get(userController.getMe, userController.getUser);

router.use(authController.restrictedTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteMe);
module.exports = router;
