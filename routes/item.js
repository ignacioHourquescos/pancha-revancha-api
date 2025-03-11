const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/Item");

//prettier-ignore
router.post("/", ItemController.createItem);

router.get("/", ItemController.getItems);

// Add the new batch update route
router.patch("/batch", ItemController.updateItemsBatch);

router.delete("/:id", ItemController.deleteItem);

module.exports = router;

//randomn text for redeploy
