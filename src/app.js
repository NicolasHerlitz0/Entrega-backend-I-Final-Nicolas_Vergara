import express from 'express';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ProductManager from './managers/ProductManager.js';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 7070;

// 1. Servidor HTTP para Socket.io
const httpServer = createServer(app);

// 2. Configurar Socket.io
const io = new Server(httpServer);

// 3. Configurar Handlebars con layout personalizado
app.engine('handlebars', engine({
    layoutsDir: path.join(__dirname, 'vistas/plantillas'),
    defaultLayout: 'principal'
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'vistas'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productManager = new ProductManager('./data/products.json');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', async (req, res) => {
    try {
        const productos = await productManager.getProducts();
        res.render('inicio', { 
            titulo: 'Inicio',
            productos
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar productos');
    }
});

app.get('/tiemporeal', async (req, res) => {
    try {
        const productos = await productManager.getProducts();
        res.render('tiemporeal', { 
            titulo: 'Productos en Tiempo Real',
            productos
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar vista');
    }
});

// 4. Configuración básica de Socket.io
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// 5. Usar httpServer en lugar de app.listen
httpServer.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
    console.log(`Inicio: http://localhost:${PORT}/`);
    console.log(`Tiempo real: http://localhost:${PORT}/tiemporeal`);
});