export function buildLinks(req, page, totalPages, currentQuery = {}) {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  let prevLink = null;
  let nextLink = null;

  const queryParams = new URLSearchParams();
  
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

  if (page > 1 && page <= totalPages) {
    const prevParams = new URLSearchParams(queryParams.toString());
    prevParams.append('page', page - 1);
    prevLink = `${baseUrl}?${prevParams.toString()}`;
  }

  if (page < totalPages) {
    const nextParams = new URLSearchParams(queryParams.toString());
    nextParams.append('page', page + 1);
    nextLink = `${baseUrl}?${nextParams.toString()}`;
  }

  return { prevLink, nextLink };
}

export function buildLinksSimple(baseUrl, page, totalPages, options = {}) {
  let prevLink = null;
  let nextLink = null;
  
  const { limit = 10, sort = null, query = {} } = options;
  
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

  if (page > 1 && page <= totalPages) {
    const prevParams = new URLSearchParams(queryParams.toString());
    prevParams.append('page', page - 1);
    prevLink = `${baseUrl}?${prevParams.toString()}`;
  }

  if (page < totalPages) {
    const nextParams = new URLSearchParams(queryParams.toString());
    nextParams.append('page', page + 1);
    nextLink = `${baseUrl}?${nextParams.toString()}`;
  }

  return { prevLink, nextLink };
}