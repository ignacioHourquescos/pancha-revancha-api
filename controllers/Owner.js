const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class OwnerController {
	async createOwner(req, res) {
		const { name, phoneNumber, email, balance } = req.body;
		console.log("Received owner data:", { name, phoneNumber, email, balance });

		try {
			const newOwner = await prisma.owner.create({
				data: {
					name,
					phoneNumber,
					email,
					balance: parseFloat(balance),
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

	// Add other owner-related methods here
}

module.exports = new OwnerController();
