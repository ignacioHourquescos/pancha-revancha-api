const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

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

	async postToInstagram(req, res) {
		try {
			const { itemId } = req.params;
			const { code } = req.body; // Get code from request body instead of env

			const item = await prisma.item.findUnique({
				where: { id: parseInt(itemId) },
			});

			if (!item) {
				return res.status(404).json({ error: "Item not found" });
			}

			const tokenResponse = await axios.post(
				"https://api.instagram.com/oauth/access_token",
				{
					client_id: process.env.INSTAGRAM_APP_ID,
					client_secret: process.env.INSTAGRAM_APP_SECRET,
					grant_type: "authorization_code",
					redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
					code: code, // Use the code from the request
				},
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				}
			);

			const accessToken = tokenResponse.data.access_token;

			// Format the caption
			const caption =
				`🛍️ ${item.name}\n\n` +
				`📝 ${item.description}\n` +
				`👕 Talle: ${item.size}\n` +
				`💰 Precio: $${item.price}\n\n` +
				`#SecondHand #Ropa #Moda`;

			// Create media container
			const mediaResponse = await axios.post(
				`https://graph.instagram.com/me/media`,
				{
					image_url: item.imageUrls[0],
					caption: caption,
					access_token: accessToken,
				}
			);

			await prisma.item.update({
				where: { id: parseInt(itemId) },
				data: {
					postedToInstagram: true,
					instagramPostId: mediaResponse.data.id,
				},
			});

			res.json({
				message: "Posted to Instagram successfully",
				postId: mediaResponse.data.id,
			});
		} catch (error) {
			console.error(
				"Error posting to Instagram:",
				error.response?.data || error
			);
			res.status(500).json({
				error: error.response?.data?.error?.message || error.message,
			});
		}
	}

	async getInstagramAuthUrl(req, res) {
		try {
			const scopes = [
				"instagram_basic",
				"instagram_content_publish",
				"instagram_manage_comments",
				"instagram_manage_insights",
				"pages_show_list",
				"pages_read_engagement",
			].join(",");

			const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
			const clientId = process.env.INSTAGRAM_APP_ID;

			// Cambiado a facebook.com en lugar de graph.facebook.com
			const authUrl =
				`https://www.facebook.com/v18.0/dialog/oauth` +
				`?client_id=${clientId}` +
				`&redirect_uri=${redirectUri}` +
				`&scope=${scopes}` +
				`&response_type=code`;

			res.json({ authUrl });
		} catch (error) {
			console.error("Error generating Instagram auth URL:", error);
			res.status(500).json({ error: error.message });
		}
	}

	async handleInstagramCallback(req, res) {
		try {
			const { code } = req.query;

			if (!code) {
				throw new Error("No authorization code received");
			}

			// Usar el código para obtener el token de acceso
			const tokenResponse = await axios.post(
				"https://api.instagram.com/oauth/access_token",
				{
					client_id: process.env.INSTAGRAM_APP_ID,
					client_secret: process.env.INSTAGRAM_APP_SECRET,
					grant_type: "authorization_code",
					redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
					code: code,
				}
			);

			// Redirigir de vuelta a la página de admin con el token
			res.redirect(`/admin?instagram_token=${tokenResponse.data.access_token}`);
		} catch (error) {
			console.error("Error handling Instagram callback:", error);
			res.redirect("/admin?error=instagram_auth_failed");
		}
	}

	async getItemById(req, res) {
		try {
			const { id } = req.params;

			const item = await prisma.item.findUnique({
				where: {
					id: parseInt(id),
				},
			});

			if (!item) {
				return res.status(404).json({
					error: "Producto no encontrado",
				});
			}

			res.json(item);
		} catch (error) {
			console.error("Error fetching item:", error);
			res.status(500).json({
				error: "Error al obtener el producto",
				details: error.message,
			});
		}
	}
}

module.exports = new ItemController();
