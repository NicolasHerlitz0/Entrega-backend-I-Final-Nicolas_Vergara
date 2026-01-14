/**
 * Construye los enlaces de paginación (prevLink y nextLink)
 * @param {Object} req - Objeto request de Express
 * @param {number} page - Página actual
 * @param {number} totalPages - Total de páginas
 * @param {Object} currentQuery - Query parameters actuales (limit, sort, category, status)
 * @returns {Object} { prevLink, nextLink }
 */
export function buildLinks(req, page, totalPages, currentQuery = {}) {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  const prevLink = null;
  const nextLink = null;

  // Construir query string base con los parámetros actuales
  const queryParams = new URLSearchParams();
  
  // Agregar parámetros actuales (excepto page)
  if (currentQuery.limit && currentQuery.limit !== 10) {
    queryParams.append('limit', currentQuery.limit);
  }
  
  if (currentQuery.sort) {
    queryParams.append('sort', currentQuery.sort);
  }
  
  if (currentQuery.category) {
    queryParams.append('category', currentQuery.category);
  }
  
  if (currentQuery.status !== undefined) {
    queryParams.append('status', currentQuery.status);
  }

  // Construir prevLink si existe página anterior
  if (page > 1 && page <= totalPages) {
    const prevParams = new URLSearchParams(queryParams.toString());
    prevParams.append('page', page - 1);
    prevLink = `${baseUrl}?${prevParams.toString()}`;
  }

  // Construir nextLink si existe página siguiente
  if (page < totalPages) {
    const nextParams = new URLSearchParams(queryParams.toString());
    nextParams.append('page', page + 1);
    nextLink = `${baseUrl}?${nextParams.toString()}`;
  }

  return { prevLink, nextLink };
}

/**
 * Versión simplificada para usar directamente en product.service.js
 * @param {string} baseUrl - URL base (ej: http://localhost:7070/api/products)
 * @param {number} page - Página actual
 * @param {number} totalPages - Total de páginas
 * @param {Object} options - Opciones de paginación (limit, sort, query)
 * @returns {Object} { prevLink, nextLink }
 */
export function buildLinksSimple(baseUrl, page, totalPages, options = {}) {
  let prevLink = null;
  let nextLink = null;
  
  const { limit = 10, sort = null, query = {} } = options;
  
  // Construir query string base
  const queryParams = new URLSearchParams();
  
  if (limit !== 10) {
    queryParams.append('limit', limit);
  }
  
  if (sort) {
    queryParams.append('sort', sort);
  }
  
  if (query.category) {
    queryParams.append('category', query.category);
  }
  
  if (query.status !== undefined) {
    queryParams.append('status', query.status);
  }

  // Página anterior
  if (page > 1 && page <= totalPages) {
    const prevParams = new URLSearchParams(queryParams.toString());
    prevParams.append('page', page - 1);
    prevLink = `${baseUrl}?${prevParams.toString()}`;
  }

  // Página siguiente
  if (page < totalPages) {
    const nextParams = new URLSearchParams(queryParams.toString());
    nextParams.append('page', page + 1);
    nextLink = `${baseUrl}?${nextParams.toString()}`;
  }

  return { prevLink, nextLink };
}