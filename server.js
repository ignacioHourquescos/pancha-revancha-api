const express = require("express");
const itemRoutes = require("./routes/item");
const ownerRoutes = require("./routes/owner");
const instagramRoutes = require("./routes/instagram");
const xmlparser = require("express-xml-bodyparser");
const cors = require("cors");

const logger = require("./middleware/logger");

const app = express();
app.use(cors());
app.use(xmlparser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(logger);

// Use route files

app.use("/items", itemRoutes);
app.use("/owners", ownerRoutes);
app.use("/instagram", instagramRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
