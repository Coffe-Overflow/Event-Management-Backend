// src/routes/admin.routes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

router.get("/stats", adminController.getDashboardStats);
router.get("/pending-events", adminController.getPendingEvents);
router.patch("/events/:id/validate", adminController.validateEvent);

module.exports = router;