const express = require("express");
const router = express.Router();
const OwnerController = require("../controllers/Owner");

router.post("/", OwnerController.createOwner);

// Add other owner-related routes here

module.exports = router;
