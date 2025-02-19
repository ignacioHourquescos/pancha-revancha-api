const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createClient } = require("@supabase/supabase-js");

const multer = require("multer");

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
});

class ItemController {
	async createItem(req, res) {
		try {
			console.log("Request body:", req.body);
			const {
				normalizedSize,
				name,
				description,
				ownerId,
				price,
				size,
				imageUrl,
				sold,
				reserved,
				imageUrls,
				brand,
				color,
			} = req.body;

			// Create item in database
			const newItem = await prisma.item.create({
				data: {
					normalizedSize: parseInt(normalizedSize),
					name,
					description,
					ownerId: parseInt(ownerId),
					price: parseFloat(price),
					size,
					imageUrl,
					reserved,
					sold,
					imageUrls,
					brand,
				},
			});

			res.status(201).json(newItem);
		} catch (error) {
			console.error("Error creating item:", error);
			res.status(500).json({ error: error.message });
		}
	}

	async getItems(req, res) {
		const { page = 1, limit = 100, ownerId } = req.query;
		const skip = (page - 1) * limit;
		console.log("ownerid", ownerId);

		try {
			const items = await prisma.item.findMany({
				where,
				take: Number(limit),
				skip: Number(skip),
				include: {
					owner: {
						select: {
							name: true,
							phoneNumber: true,
						},
					},
				},
			});

			const total = await prisma.item.count({ where });

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
	}
}

module.exports = new ItemController();
