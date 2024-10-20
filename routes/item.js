const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/Item");

//prettier-ignore
router.post("/", ItemController.createItem);

router.get("/", ItemController.getItems);

module.exports = router;
