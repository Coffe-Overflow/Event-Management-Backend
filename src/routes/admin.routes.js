const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.get("/stats/dashboard", authMiddleware, roleMiddleware("ADMIN"), adminController.getDashboardStats);

router.get("/events", authMiddleware, roleMiddleware("ADMIN"), adminController.getEventsByStatus);
router.patch("/events/:id/status", authMiddleware, roleMiddleware("ADMIN"), adminController.updateEventStatus);

router.get("/reports/timeline", authMiddleware, roleMiddleware("ADMIN"), adminController.getEventsTimeline);
router.get("/reports/categories", authMiddleware, roleMiddleware("ADMIN"), adminController.getEventsByCategory);
router.get("/reports/faculties", authMiddleware, roleMiddleware("ADMIN"), adminController.getEventsByFaculty);

router.patch("/users/:id/role", authMiddleware, roleMiddleware("ADMIN"), adminController.updateUserRole);
router.get("/users",authMiddleware,roleMiddleware("ADMIN"),adminController.getAllUsers);


module.exports = router;
