const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/Item");

//prettier-ignore
router.post("/", ItemController.createItem);
router.post("/like/:itemId", ItemController.like_item);
router.get("/", ItemController.getItems);

module.exports = router;

//randomn text for redeploy
