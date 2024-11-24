const express = require("express");
const router = express.Router();
const OwnerController = require("../controllers/owner");

router.post("/createOwner", OwnerController.createOwner);
router.get("/getOwnerByPhone/:phoneNumber", OwnerController.getOwnerByPhone);
// Add other owner-related routes here

module.exports = router;
