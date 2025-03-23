const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/Item");

//prettier-ignore
router.post("/", ItemController.createItem);
router.get("/:id", ItemController.getItemById);

router.get("/", ItemController.getItems);

// Add the new batch update route
router.patch("/batch", ItemController.updateItemsBatch);

router.delete("/:id", ItemController.deleteItem);

router.post("/:itemId/post-to-instagram", ItemController.postToInstagram);

// Add this new route
router.get("/instagram/auth", ItemController.getInstagramAuthUrl);

module.exports = router;

//randomn text for redeploy
