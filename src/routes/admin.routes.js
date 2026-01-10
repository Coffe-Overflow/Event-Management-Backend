const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/organizers",
  authMiddleware,
  adminController.createOrganizer
);

module.exports = router;
