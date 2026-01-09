
export default function registerProductSockets(io, productManager) {
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

        if (productoEliminado !== null) {
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
}
