export default function registerProductSockets(io, productService) {
  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Enviar productos al conectar
    socket.on("solicitarProductos", async () => {
      try {
        const productos = await productService.getProducts();
        socket.emit("productosActualizados", productos || []);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        socket.emit("productosActualizados", []);
      }
    });

    // Agregar nuevo producto
    socket.on("agregarProducto", async (productoData) => {
      try {
        // Convertir tipos (el front envía strings)
        const processedData = {
          ...productoData,
          price: parseFloat(productoData.price),
          stock: parseInt(productoData.stock)
        };

        const nuevoProducto = await productService.addProduct(processedData);

        if (nuevoProducto === null) {
          socket.emit("errorAgregarProducto", "Error: Código duplicado o datos inválidos");
          return;
        }

        // Obtener y enviar lista actualizada
        const productos = await productService.getProducts();
        io.emit("productosActualizados", productos || []);
        console.log("Producto agregado vía websocket:", nuevoProducto);
      } catch (error) {
        console.error("Error al agregar producto:", error);
        socket.emit("errorAgregarProducto", "Error interno del servidor");
      }
    });

    // Eliminar producto
    socket.on("eliminarProducto", async (idProducto) => {
      try {
        // El front envía número, pero ahora necesitamos ObjectId
        // Convertimos a string para validación (el front debe adaptarse)
        const productId = String(idProducto);

        const productoEliminado = await productService.deleteProduct(productId);

        if (productoEliminado === null) {
          socket.emit("errorEliminarProducto", "Producto no encontrado");
          return;
        }

        // Obtener y enviar lista actualizada
        const productos = await productService.getProducts();
        io.emit("productosActualizados", productos || []);
        console.log("Producto eliminado vía websocket:", productoEliminado);
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        socket.emit("errorEliminarProducto", "Error interno del servidor");
      }
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });
}