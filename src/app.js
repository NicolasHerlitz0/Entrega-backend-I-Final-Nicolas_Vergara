// se mantiene (conecta a DB, monta routers, vistas y sockets)
import express from "express";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import ProductManager from "./managers/ProductManager.js";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import registerProductSockets from "./sockets/products.socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 7070;
const productManager = new ProductManager("./data/products.json");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/socket.io",
  cors: {
    origin: "http://localhost:7070",
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

app.get("/", async (req, res) => {
  try {
    const productos = await productManager.getProducts();
    res.render("inicio", {
      titulo: "Inicio",
      productos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar productos");
  }
});

app.get("/tiemporeal", async (req, res) => {
  try {
    const productos = await productManager.getProducts();
    res.render("tiemporeal", {
      titulo: "Productos en Tiempo Real",
      productos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar vista");
  }
});

registerProductSockets(io, productManager);

httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Inicio: http://localhost:${PORT}/`);
  console.log(`Tiempo real: http://localhost:${PORT}/tiemporeal`);
  console.log(`Socket.io endpoint: http://localhost:${PORT}/socket.io/socket.io.js`);
});


