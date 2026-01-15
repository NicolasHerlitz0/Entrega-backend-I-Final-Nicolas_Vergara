import express from "express";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/connection.js";
import ProductService from "./services/product.service.js";
import CartService from "./services/cart.service.js";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import registerProductSockets from "./sockets/products.socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7070;

// Conectar a MongoDB
await connectDB();

// Servicios
const productService = new ProductService();
const cartService = new CartService();

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
    helpers: {
      eq: (a, b) => a === b,
    },
    
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "vistas"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  if (req.query._method) {
    req.method = req.query._method;
  }
  next();
});

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

// Vista de productos con paginación
app.get("/products", async (req, res) => {
  try {
    const { limit, page, sort, category, status } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 10,
      page: page ? parseInt(page) : 1,
      sort: sort || null,
      query: {},
    };

    if (category && category.trim() !== "") {
      options.query.category = category;
    }
    if (status !== undefined && status !== "") {
      options.query.status = status === "true" || status === true;
    }

    const result = await productService.getPaginatedProducts(options);

    if (result === null) {
      return res.status(500).render("error", {
        titulo: "Error",
        mensaje: "Error al cargar productos",
      });
    }

    res.render("products", {
      titulo: "Productos",
      ...result,
      query: req.query,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      titulo: "Error",
      mensaje: "Error interno del servidor",
    });
  }
});


// Vista de detalle de carrito
app.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    if (cid.length !== 24) {
      return res.status(400).render("error", {
        titulo: "Error",
        mensaje: "ID de carrito inválido",
      });
    }

    const cart = await cartService.getCartById(cid);

    if (!cart) {
      return res.status(404).render("error", {
        titulo: "No encontrado",
        mensaje: "Carrito no encontrado",
      });
    }

    res.render("cartDetail", {
      titulo: `Carrito ${cid}`,
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      titulo: "Error",
      mensaje: "Error interno del servidor",
    });
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

// Registrar sockets
registerProductSockets(io, productService);

httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Inicio: http://localhost:${PORT}/`);
  console.log(`Productos (paginación): http://localhost:${PORT}/products`);
  console.log(`Tiempo real: http://localhost:${PORT}/tiemporeal`);
  console.log(`Ejemplo carrito: http://localhost:${PORT}/carts/[ID_CARRITO]`);
  console.log(
    `Socket.io endpoint: http://localhost:${PORT}/socket.io/socket.io.js`
  );
});
