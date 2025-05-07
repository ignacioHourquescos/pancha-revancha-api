const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const twilio = require("twilio");
require("dotenv").config();

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
			// Configurar cliente de Twilio
			const client = twilio(
				process.env.TWILIO_ACCOUNT_SID,
				process.env.TWILIO_AUTH_TOKEN
			);

			// Crear el mensaje usando un template aprobado
			await client.messages.create({
				from: "whatsapp:+14155238886",
				to: "whatsapp:+5491165106333",
				// Usar un template aprobado por WhatsApp
				templateId: "HX30644fc27edef3b8a2107d111a175082", // Reemplazar con tu ID de template
				contentSid: "HX30644fc27edef3b8a2107d111a175082", // Reemplazar con tu Content SID
				contentVariables: JSON.stringify({
					1: ownerId,
					2: totalItems.toString(),
					3: totalValue.toString(),
					4: items
						.map(
							(item) =>
								`${item.name} - ${item.brand || "N/A"} - $${item.price || 0}`
						)
						.join("\n"),
				}),
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

	async sendWhatsAppLink(req, res) {
		try {
			const { phoneNumber } = req.body;

			if (!phoneNumber) {
				return res.status(400).json({ error: "Número de teléfono requerido" });
			}

			// Configurar cliente de Twilio
			const client = twilio(
				process.env.TWILIO_ACCOUNT_SID,
				process.env.TWILIO_AUTH_TOKEN
			);

			// URL del frontend para continuar el onboarding
			const onboardingUrl = `${process.env.FRONTEND_URL}/onboarding?phone=${phoneNumber}`;

			//SANDBOX+15025034984
			// Enviar mensaje de WhatsApp con el link
			await client.messages.create({
				from: "whatsapp:+15025034984", // Tu número de Twilio WhatsApp
				to: `whatsapp:+${phoneNumber}`,
				body: `¡Bienvenido a Revancha! Para continuar con tu registro, haz clic en el siguiente enlace: ${onboardingUrl}`,
			});

			res.json({
				success: true,
				message: "Link de verificación enviado",
				phoneNumber,
			});
		} catch (error) {
			console.error("Error al enviar link:", error);
			res.status(500).json({
				error: "Error al enviar link de verificación",
				details: error.message,
			});
		}
	}

	async partnerLogin(req, res) {
		const { phoneNumber } = req.body;

		try {
			// Usar el método existente para buscar el owner
			const owner = await prisma.owner.findFirst({
				where: {
					phoneNumber: phoneNumber,
				},
			});

			if (!owner) {
				return res.status(401).json({
					success: false,
					message: "Usuario no encontrado",
				});
			}

			// Si el usuario existe, devolver la información necesaria
			return res.status(200).json({
				success: true,
				message: "Login exitoso",
				owner: {
					id: owner.id,
					name: owner.name,
					phoneNumber: owner.phoneNumber,
				},
			});
		} catch (error) {
			console.error("Error en login:", error);
			res.status(500).json({
				success: false,
				error: "Error en el proceso de login",
				details: error.message,
			});
		}
	}

	async getItemsCount(req, res) {
		const { ownerId } = req.params;

		try {
			const itemCount = await prisma.item.count({
				where: {
					ownerId: parseInt(ownerId),
				},
			});

			return res.status(200).json({
				success: true,
				count: itemCount,
			});
		} catch (error) {
			console.error("Error al obtener cantidad de items:", error);
			res.status(500).json({
				success: false,
				error: "Error al obtener cantidad de items",
				details: error.message,
			});
		}
	}

	// Add other owner-related methods here
}

module.exports = new OwnerController();
