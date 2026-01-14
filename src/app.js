import express from "express";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/connection.js";
import ProductService from "./services/product.service.js";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import registerProductSockets from "./sockets/products.socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7070;

// Conectar a MongoDB
await connectDB();

// Inicializar servicios (ya no managers)
const productService = new ProductService();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/socket.io",
  cors: {
    origin: `http://localhost:${PORT}`,
    methods: ["GET", "POST"],
  },
});

app.engine(
  "handlebars",
  engine({
    layoutsDir: path.join(__dirname, "vistas/plantillas"),
    defaultLayout: "principal",
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "vistas"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Vista de inicio
app.get("/", async (req, res) => {
  try {
    const productos = await productService.getProducts();
    res.render("inicio", {
      titulo: "Inicio",
      productos: productos || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar productos");
  }
});

// Vista de tiempo real
app.get("/tiemporeal", async (req, res) => {
  try {
    const productos = await productService.getProducts();
    res.render("tiemporeal", {
      titulo: "Productos en Tiempo Real",
      productos: productos || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar vista");
  }
});

// Registrar sockets con el servicio de productos
registerProductSockets(io, productService);

httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Inicio: http://localhost:${PORT}/`);
  console.log(`Tiempo real: http://localhost:${PORT}/tiemporeal`);
  console.log(`Socket.io endpoint: http://localhost:${PORT}/socket.io/socket.io.js`);
});