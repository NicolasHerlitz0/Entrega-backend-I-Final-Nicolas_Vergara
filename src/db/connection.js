import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    console.log(`Base de datos: ${conn.connection.name}`);

    //Eventos
    mongoose.connection.on("error", (err) => {
      console.error("Error de MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB desconectado");
    });

    return conn;
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};
