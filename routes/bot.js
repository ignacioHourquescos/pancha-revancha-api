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
router.get("/status", (req, res) => BotController.getStatus(req, res));
router.post("/reset", (req, res) => BotController.resetConnection(req, res));
router.get("/debug", (req, res) => {
	res.json({
		env: process.env.NODE_ENV,
		authPath: BotController.authFolder,
		hasQR: !!BotController.qr,
		isConnected: BotController.isConnected,
		timestamp: new Date().toISOString(),
	});
});

module.exports = router;
