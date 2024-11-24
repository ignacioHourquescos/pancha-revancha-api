const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

	// Add other owner-related methods here
}

module.exports = new OwnerController();
