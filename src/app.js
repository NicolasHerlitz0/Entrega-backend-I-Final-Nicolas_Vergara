import express from "express";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import ProductManager from "./managers/ProductManager.js";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";

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

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("solicitarProductos", async () => {
    try {
      const productos = await productManager.getProducts();
      socket.emit("productosActualizados", productos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  });

  socket.on("agregarProducto", async (productoData) => {
    try {
      const nuevoProducto = await productManager.addProduct(productoData);
      const productos = await productManager.getProducts();
      io.emit("productosActualizados", productos);
      console.log("Producto agregado vía websocket:", nuevoProducto);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      socket.emit("errorAgregarProducto", error.message);
    }
  });

  socket.on("eliminarProducto", async (idProducto) => {
    try {
      const productoEliminado = await productManager.deleteProduct(idProducto);

      if (productoEliminado) {
        const productos = await productManager.getProducts();
        io.emit("productosActualizados", productos);
        console.log("Producto eliminado vía websocket:", productoEliminado);
      } else {
        socket.emit("errorEliminarProducto", "Producto no encontrado");
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      socket.emit("errorEliminarProducto", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Inicio: http://localhost:${PORT}/`);
  console.log(`Tiempo real: http://localhost:${PORT}/tiemporeal`);
  console.log(
    `Socket.io endpoint: http://localhost:${PORT}/socket.io/socket.io.js`
  );
});
// prueba de rama secundaria
