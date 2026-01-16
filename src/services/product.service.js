import Product from "../models/product.models.js";
import { buildLinksSimple } from "../utils/buildLinks.js";

class ProductService {
  // Obtener productos (sin paginación)
  async getProducts() {
    try {
      const products = await Product.find({});
      return products;
    } catch (error) {
      console.error("Error en getProducts:", error.message);
      return null;
    }
  }

  // Obtener producto por ID
  async getProductById(id) {
    try {
      if (id.length !== 24) {
        return null;
      }

      const product = await Product.findById(id);
      return product;
    } catch (error) {
      console.error("Error en getProductById:", error.message);
      return null;
    }
  }

  // Crear nuevo producto
  async addProduct(productData) {
    try {
      const existingProduct = await Product.findOne({ code: productData.code });
      if (existingProduct) {
        return null;
      }

      const newProduct = new Product(productData);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      console.error("Error en addProduct:", error.message);
      return null;
    }
  }

  // Actualizar producto
  async updateProduct(id, updatedFields) {
    try {
      if (id.length !== 24) {
        return null;
      }

      const allowedFields = [
        "title",
        "description",
        "price",
        "code",
        "stock",
        "category",
        "status",
      ];
      const filteredFields = {};

      Object.keys(updatedFields).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredFields[key] = updatedFields[key];
        }
      });

      // Verificar nuevo código
      if (filteredFields.code) {
        const existingWithCode = await Product.findOne({
          code: filteredFields.code,
          _id: { $ne: id },
        });

        if (existingWithCode) {
          return null;
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: filteredFields },
        { new: true, runValidators: true }
      );

      return updatedProduct;
    } catch (error) {
      console.error("Error en updateProduct:", error.message);
      return null;
    }
  }

  // Eliminar producto
  async deleteProduct(id) {
    try {
      if (id.length !== 24) {
        return null;
      }

      const deletedProduct = await Product.findByIdAndDelete(id);
      return deletedProduct;
    } catch (error) {
      console.error("Error en deleteProduct:", error.message);
      return null;
    }
  }

  // Obtener productos paginados con filtros
  async getPaginatedProducts(options = {}) {
    try {
      const { limit = 10, page = 1, query = {}, sort = null } = options;

      const filter = {};

      if (query.category) {
        filter.category = query.category;
      }

      if (query.status !== undefined) {
        filter.status = query.status === "true" || query.status === true;
      }

      let sortOptions = {};
      if (sort === "asc") {
        sortOptions.price = 1;
      } else if (sort === "desc") {
        sortOptions.price = -1;
      }

      // Calcular paginación
      const skip = (page - 1) * limit;

      // Consulta
      const [products, totalProducts] = await Promise.all([
        Product.find(filter).sort(sortOptions).skip(skip).limit(limit),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalProducts / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;

      // Generar links de paginación
      const { prevLink, nextLink } = buildLinksSimple(
        "/api/products",
        page,
        totalPages,
        { limit, sort, query }
      );

      return {
        status: "success",
        payload: products,
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page: parseInt(page),
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
      };
    } catch (error) {
      console.error("Error en getPaginatedProducts:", error.message);
      return null;
    }
  }
}

export default ProductService;
