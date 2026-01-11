const express = require("express");
const router = express.Router();

const organizersController = require("../controllers/organizers.controller");
const organizerDashboardController = require("../controllers/organizer-dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/events",authMiddleware,organizerDashboardController.getMyEvents
);

router.post("/events",authMiddleware,organizerDashboardController.createEvent
);

router.get("/", organizersController.listOrganizers);
router.get("/:id", organizersController.getOrganizer);
router.post("/", organizersController.createOrganizer);
router.put("/:id", organizersController.updateOrganizer);
router.delete("/:id", organizersController.deleteOrganizer);

module.exports = router;
