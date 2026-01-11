const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events.controller");
const authMiddleware = require("../middleware/auth.middleware");


router.get("/", eventsController.getEvents);
router.get("/:id", eventsController.getEventById);


router.post("/:id/register", authMiddleware, eventsController.registerForEvent);
router.post("/", authMiddleware, eventsController.createEvent);
router.get("/:id/participants", authMiddleware, eventsController.getParticipants);

router.post("/:id/reviews",authMiddleware,eventsController.addReview);
router.get("/:id/reviews",eventsController.getEventReviews);

module.exports = router;
