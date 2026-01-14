const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events.controller");
const authMiddleware = require("../middleware/auth.middleware");


router.get("/", eventsController.getEvents);

router.post("/:id/register", authMiddleware, eventsController.registerForEvent);
router.post('/:id/unregister', authMiddleware, eventsController.unregisterFromEvent);
router.post("/", authMiddleware, eventsController.createEvent);
router.get("/:id/participants", authMiddleware, eventsController.getParticipants);

router.post("/:id/reviews",authMiddleware,eventsController.addReview);
router.get("/:id/reviews",eventsController.getEventReviews);

router.get("/:id", eventsController.getEventById);

module.exports = router;
