const express = require("express");
const userController = require("./../controllers/UserController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.use(authController.protect);
router.patch("/updateMyPassword", authController.updatePassword);
router.get(
  "/me",

  userController.getMe,
  userController.getuser
);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
router.use(authController.restrictTo("admin"));
router.route("/").get(userController.getusers).post(userController.createusers);
router
  .route("/:id")
  .get(userController.getuser)
  .post(userController.createusers)
  .patch(userController.updateuser)
  .delete(userController.deleteuser);

module.exports = router;
