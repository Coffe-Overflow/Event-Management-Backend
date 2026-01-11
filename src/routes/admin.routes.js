const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");


router.get("/stats/dashboard",authMiddleware,adminController.getDashboardStats);

router.get("/events",authMiddleware,adminController.getEventsByStatus);
router.patch("/events/:id/status",authMiddleware,adminController.updateEventStatus);

router.get("/reports/timeline", authMiddleware, adminController.getEventsTimeline);
router.get("/reports/categories", authMiddleware, adminController.getEventsByCategory);
router.get("/reports/faculties", authMiddleware, adminController.getEventsByFaculty);

module.exports = router;
