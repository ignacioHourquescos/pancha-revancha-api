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
		console.log("ownerId:", ownerId); // Log the ownerId for debugging

		try {
			const where = {}; // Ensure where is defined here
			if (ownerId) {
				where.ownerId = Number(ownerId); // Convert ownerId to a number
			}

			const items = await prisma.item.findMany({
				where, // Use the where object here
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

			const total = await prisma.item.count({ where }); // Use the where object here

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

	async updateItemsBatch(req, res) {
		try {
			const { changes } = req.body;

			// Process each item's changes
			const updates = Object.entries(changes).map(
				async ([itemId, itemChanges]) => {
					// No need to convert to snake_case, keep camelCase for Prisma
					const processedChanges = Object.entries(itemChanges).reduce(
						(acc, [field, value]) => {
							// Convert any string numbers to actual numbers for number fields
							if (field === "normalizedSize" || field === "price") {
								acc[field] = Number(value);
							} else {
								acc[field] = value;
							}
							return acc;
						},
						{}
					);

					// Update the item in the database
					return prisma.item.update({
						where: { id: parseInt(itemId) },
						data: processedChanges,
					});
				}
			);

			// Wait for all updates to complete
			await Promise.all(updates);

			res.json({ message: "Items updated successfully" });
		} catch (error) {
			console.error("Error updating items in batch:", error);
			res.status(500).json({ error: error.message });
		}
	}

	async deleteItem(req, res) {
		try {
			const { id } = req.params;

			await prisma.item.delete({
				where: {
					id: parseInt(id),
				},
			});

			res.json({ message: "Item deleted successfully" });
		} catch (error) {
			console.error("Error deleting item:", error);
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = new ItemController();
