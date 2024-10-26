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
			const { userName, userPhone, ...itemData } = req.body;

			// Find or create user
			let user = await prisma.owner.findFirst({
				where: { name: userName, phoneNumber: userPhone },
			});
			console.log("USER", user);

			if (!user) {
				user = await prisma.owner.create({
					data: {
						name: userName,
						phoneNumber: userPhone,
					},
				});
			}

			// Create item
			const newItem = await prisma.item.create({
				data: {
					...itemData,

					ownerId: user.id,
				},
			});

			res.status(201).json(newItem);
		} catch (error) {
			console.error("Error creating item:", error);
			res.status(500).json({ error: "Failed to create item" });
		}
	}

	async getItems(req, res) {
		const { page = 1, limit = 100 } = req.query;
		const skip = (page - 1) * limit;

		try {
			const items = await prisma.item.findMany({
				take: Number(limit),
				skip: Number(skip),
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
	}

	async like_item(req, res) {
		const { itemId } = req.params;
		try {
			const item = await prisma.item.update({
				where: {
					id: Number(itemId),
				},
				data: {
					likes: {
						increment: 1,
					},
				},
			});
			res.status(200).json(item);
		} catch (error) {
			console.error("Error liking item:", error);
			res.status(500).json({ error: "Failed to like item" });
		}
	}
}

module.exports = new ItemController();
