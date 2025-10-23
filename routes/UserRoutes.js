const express = require('express');
const userController = require('./../controllers/UserController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/').get(userController.getusers).post(userController.createusers);
router
  .route('/:id')
  .get(userController.getuser)
  .post(userController.createuser)
  .patch(userController.updateuser)
  .delete(userController.delereuser);

module.exports = router;
