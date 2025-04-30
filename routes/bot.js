const express = require("express");
const router = express.Router();
const BotController = require("../controllers/Bot");

// Ruta para enviar mensajes
router.post("/send", async (req, res) => {
	try {
		const { to, message } = req.body;
		const result = await BotController.sendMessage(to, message);
		res.json(result);
	} catch (error) {
		res.status(500).json({
			error: "Error al enviar mensaje",
			details: error.message,
		});
	}
});

// Ruta para obtener el estado de conexión y QR
router.get("/status", (req, res) => {
	const status = BotController.getConnectionStatus();
	res.json(status);
});

module.exports = router;
