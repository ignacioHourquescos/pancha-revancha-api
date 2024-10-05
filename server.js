const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { default: axios } = require("axios");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Ruta para obtener todos los usuarios
app.get("/users", async (req, res) => {
	const users = await prisma.user.findMany();
	res.json(users);
});

// Ruta para crear un nuevo usuario
app.post("/items", async (req, res) => {
	const {
		name,
		description,
		size,
		normalizedSize,
		ownerId,
		reserved,
		sold,
		images,
	} = req.body;
	console.log("Received item data:", {
		name,
		description,
		size,
		normalizedSize,
		ownerId,
		reserved,
		sold,
		images,
	});

	try {
		const newItem = await prisma.item.create({
			data: {
				name,
				description,
				size,
				normalizedSize,
				reserved,
				sold,
				images,
				owner: {
					connect: { id: ownerId },
				},
			},
			include: {
				owner: true,
			},
		});

		console.log("Created item:", newItem);
		res.status(201).json(newItem);
	} catch (error) {
		console.error("Error details:", error);
		res
			.status(500)
			.json({ error: "Error al crear el item", details: error.message });
	}
});

app.post("/owner", async (req, res) => {
	const { name, phoneNumber, email, balance } = req.body;
	console.log("Received owner data:", { name, phoneNumber, email, balance });

	try {
		const newOwner = await prisma.owner.create({
			data: {
				name,
				phoneNumber,
				email,
				balance: parseFloat(balance), // Ensure balance is stored as a float
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
});
app.get("/items", async (req, res) => {
	const { page = 1, limit = 10 } = req.query;
	const skip = (page - 1) * limit;

	try {
		const items = await prisma.item.findMany({
			take: Number(limit),
			skip: Number(skip),
			include: {
				owner: {
					select: {
						name: true,
						phoneNumber: true,
						email: true,
						balance: true,
					},
				},
			},
		});

		const total = await prisma.item.count();

		res.json({
			items,
			currentPage: Number(page),
			totalPages: Math.ceil(total / Number(limit)),
			totalItems: total,
		});
	} catch (error) {
		console.error("Error fetching items:", error);
		res
			.status(500)
			.json({ error: "Error al obtener los items", details: error.message });
	}
});
// ... otras rutas según sea necesario

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
