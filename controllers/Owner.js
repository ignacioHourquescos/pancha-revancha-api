const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const twilio = require("twilio");

class OwnerController {
	async createOwner(req, res) {
		const { name, phoneNumber } = req.body;
		console.log("Received owner data:", { name, phoneNumber });

		try {
			const newOwner = await prisma.owner.create({
				data: {
					name,
					phoneNumber,
				},
			});

			console.log("Created owner:", newOwner);
			res.status(201).json(newOwner);
		} catch (error) {
			console.error("Error details:", error);
			if (error.code === "P2002") {
				res.status(400).json({
					error: "Error al crear el dueño",
					details: "El email ya está en uso",
				});
			} else {
				res
					.status(500)
					.json({ error: "Error al crear el dueño", details: error.message });
			}
		}
	}

	async getOwnerByPhone(req, res) {
		const { phoneNumber } = req.params;

		try {
			const owner = await prisma.owner.findFirst({
				where: {
					phoneNumber: phoneNumber,
				},
			});

			if (!owner) {
				return res.status(200).json(null);
			}

			return res.status(200).json(owner);
		} catch (error) {
			console.error("Error details:", error);
			res.status(500).json({
				error: "Error al buscar el dueño",
				details: error.message,
			});
		}
	}

	async requestQuotation(req, res) {
		const { totalItems, totalValue, ownerId, items } = req.body;

		try {
			// Buscar el owner para obtener más detalles

			// Configurar cliente de Twilio usando variables de entorno
			const client = twilio(
				process.env.TWILIO_ACCOUNT_SID,
				process.env.TWILIO_AUTH_TOKEN
			);

			// Crear el mensaje con el detalle de las prendas
			const itemsList = items
				.map(
					(item) =>
						`${item.name} - ${item.brand || "N/A"} - $${item.price || 0}`
				)
				.join("\n");

			const message = `
🛍️ Nueva Solicitud de Valorización

👤 Cliente: ${ownerId}

📦 Total Items: ${totalItems}
💰 Valor Total: $${totalValue}

📝 Detalle de prendas:
${itemsList}

📅 Fecha: ${new Date().toLocaleString()}
			`;

			// Enviar mensaje de WhatsApp
			await client.messages.create({
				body: message,
				from: "whatsapp:+14155238886",
				to: "whatsapp:+5491165106333",
			});

			res.status(200).json({
				message: "Solicitud de valorización enviada correctamente",
			});
		} catch (error) {
			console.error("Error en la solicitud de valorización:", error);
			res.status(500).json({
				error: "Error al procesar la solicitud de valorización",
				details: error.message,
			});
		}
	}

	// Add other owner-related methods here
}

module.exports = new OwnerController();
