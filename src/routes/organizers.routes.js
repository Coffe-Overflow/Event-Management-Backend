// src/routes/organizers.routes.js

const express = require("express");
const router = express.Router();
// 1. Asigură-te că calea este corectă
const organizersController = require('../controllers/organizers.controller'); 
const organizerDashboardController = require("../controllers/organizer-dashboard.controller");

// --- RUTE ORGANIZATORI ---

router.get("/stats", organizerDashboardController.getOrganizerStats);

// GET ALL: listOrganizers
router.get("/", organizersController.listOrganizers);

// GET BY ID: getOrganizer
router.get("/:id", organizersController.getOrganizer);

// POST: createOrganizer
router.post("/", organizersController.createOrganizer);

// PUT: updateOrganizer
router.put("/:id", organizersController.updateOrganizer);

// DELETE: deleteOrganizer
router.delete("/:id", organizersController.deleteOrganizer);

// Exportul obiectului Router
module.exports = router;