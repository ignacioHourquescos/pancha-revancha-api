const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/item");

//prettier-ignore
router.post("/", ItemController.createItem);

router.get("/", ItemController.getItems);

module.exports = router;

//randomn text for redeploy
