const express = require("express");
const router = express.Router();
const organizersController = require('../controllers/organizers.controller'); 

router.get("/", organizersController.listOrganizers);

router.get("/:id", organizersController.getOrganizer);

router.post("/", organizersController.createOrganizer);

router.put("/:id", organizersController.updateOrganizer);

router.delete("/:id", organizersController.deleteOrganizer);

module.exports = router;