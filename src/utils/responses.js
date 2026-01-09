
// src/utils/responses.js

export function ok(res, data, message) {
  if (message) {
    return res.json({ success: true, message, data });
  }
  return res.json({ success: true, data });
}

export function err(res, httpStatus, code, message, details = null) {
  return res.status(httpStatus).json({
    success: false,
    error: { code, message, details }
  });
}
