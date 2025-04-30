const {
	default: makeWASocket,
	DisconnectReason,
	useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode");
const path = require("path");

class BotController {
	constructor() {
		this.sock = null;
		this.authFolder = path.join(__dirname, "../auth");
		this.qr = null;
		this.isConnected = false;
		this.initializeWhatsApp();
	}

	async initializeWhatsApp() {
		try {
			// Obtener estado de autenticación
			const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);

			// Crear conexión de WhatsApp
			this.sock = makeWASocket({
				printQRInTerminal: true,
				auth: state,
				qrTimeout: 40000,
			});

			// Manejar actualizaciones de conexión
			this.sock.ev.on("connection.update", async (update) => {
				const { connection, lastDisconnect, qr } = update;

				if (qr) {
					// Convertir QR a imagen base64
					this.qr = await qrcode.toDataURL(qr);
				}

				if (connection === "open") {
					this.isConnected = true;
					this.qr = null;
					console.log("Conectado exitosamente!");
				}

				if (connection === "close") {
					this.isConnected = false;
					const shouldReconnect =
						(lastDisconnect?.error instanceof Boom)?.output?.statusCode !==
						DisconnectReason.loggedOut;

					console.log("Conexión cerrada debido a:", lastDisconnect?.error);

					if (shouldReconnect) {
						await this.initializeWhatsApp();
					}
				}

				console.log("Estado de conexión:", connection);
			});

			// Guardar credenciales cuando se actualicen
			this.sock.ev.on("creds.update", saveCreds);

			// Manejar mensajes entrantes
			this.sock.ev.on("messages.upsert", async (m) => {
				if (m.type === "notify") {
					for (const msg of m.messages) {
						if (!msg.key.fromMe) {
							const from = msg.key.remoteJid;
							const messageText =
								msg.message?.conversation ||
								msg.message?.extendedTextMessage?.text ||
								"";

							console.log("Mensaje recibido:", {
								from,
								message: messageText,
							});

							// Aquí puedes agregar la lógica para responder mensajes
							await this.handleIncomingMessage(from, messageText);
						}
					}
				}
			});
		} catch (error) {
			console.error("Error al inicializar WhatsApp:", error);
		}
	}

	async handleIncomingMessage(from, message) {
		try {
			// Ejemplo básico de respuesta
			if (message.toLowerCase() === "hola") {
				await this.sock.sendMessage(from, {
					text: "¡Hola! Soy el bot de Revancha. ¿En qué puedo ayudarte?",
				});
			}
		} catch (error) {
			console.error("Error al manejar mensaje:", error);
		}
	}

	// Método para enviar mensajes desde otras partes de la aplicación
	async sendMessage(to, message) {
		try {
			if (!this.sock) {
				throw new Error("WhatsApp no está inicializado");
			}

			await this.sock.sendMessage(to, { text: message });
			return { success: true, message: "Mensaje enviado correctamente" };
		} catch (error) {
			console.error("Error al enviar mensaje:", error);
			throw error;
		}
	}

	// Método para obtener el estado actual del QR y la conexión
	getConnectionStatus() {
		return {
			isConnected: this.isConnected,
			qr: this.qr,
		};
	}
}

// Exportar una única instancia del controlador
module.exports = new BotController();
