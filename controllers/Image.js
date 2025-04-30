const sharp = require("sharp");
const axios = require("axios");

async function compressImage(imageUrl) {
	try {
		// Descargar la imagen desde la URL
		const response = await axios({
			url: imageUrl,
			responseType: "arraybuffer",
		});

		// Convertir el buffer a una imagen y comprimirla
		let compressedImage = sharp(response.data);

		// Obtener metadata de la imagen
		const metadata = await compressedImage.metadata();

		// Calcular las nuevas dimensiones manteniendo el aspect ratio
		const aspectRatio = metadata.width / metadata.height;
		let newWidth = metadata.width;
		let newHeight = metadata.height;

		// Reducir el tamaño si es necesario
		if (metadata.width > 800) {
			newWidth = 800;
			newHeight = Math.round(newWidth / aspectRatio);
		}

		// Comprimir la imagen
		const compressedBuffer = await compressedImage
			.resize(newWidth, newHeight)
			.jpeg({
				quality: 80,
				progressive: true,
				force: false,
			})
			.webp({
				quality: 80,
				force: false,
			})
			.png({
				compressionLevel: 9,
				force: false,
			})
			.toBuffer();

		// Verificar si el tamaño es menor a 100kb
		if (compressedBuffer.length > 100 * 1024) {
			// Si aún es mayor a 100kb, comprimir más
			const quality = Math.floor(((100 * 1024) / compressedBuffer.length) * 80);
			return await compressedImage
				.resize(newWidth, newHeight)
				.jpeg({
					quality: quality,
					progressive: true,
				})
				.toBuffer();
		}

		return compressedBuffer;
	} catch (error) {
		console.error("Error comprimiendo imagen:", error);
		throw new Error("Error al comprimir la imagen");
	}
}

module.exports = {
	// ... otras funciones existentes ...
	compressImage,
};
