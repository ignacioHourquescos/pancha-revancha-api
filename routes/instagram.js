const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/Item");

router.get("/callback", ItemController.handleInstagramCallback);

module.exports = router;
