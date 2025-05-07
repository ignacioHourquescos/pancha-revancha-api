const express = require("express");
const router = express.Router();
const OwnerController = require("../controllers/Owner");

router.post("/createOwner", OwnerController.createOwner);
router.get("/getOwnerByPhone/:phoneNumber", OwnerController.getOwnerByPhone);
router.post("/requestQuotation", OwnerController.requestQuotation);
router.post("/send-link", OwnerController.sendWhatsAppLink);
router.post("/partner-login", OwnerController.partnerLogin);
router.get("/items-count/:ownerId", OwnerController.getItemsCount);

// Add other owner-related routes here

module.exports = router;
