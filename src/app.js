import express from 'express';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import path from 'path';
import ProductManager from './managers/ProductManager.js';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';

// Para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 7070;

// Configurar Handlebars (MUY SIMPLE)
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'vistas'));

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear instancia de ProductManager (UNA SOLA VEZ)
const productManager = new ProductManager('./data/products.json');

// Rutas API (las que ya tenías)
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta para vista INICIO
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

// Ruta para vista TIEMPO REAL
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(` Servidor en http://localhost:${PORT}`);
    console.log(`Inicio: http://localhost:${PORT}/`);
    console.log(` Tiempo real: http://localhost:${PORT}/tiemporeal`);
});