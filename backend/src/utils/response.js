/**
 * Uniform Standardized API Response Helpers
 */
const successResponse = (res, data = null, message = 'Berhasil', statusCode = 200, meta = undefined) => {
  const payload = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(payload);
};

const errorResponse = (res, message = 'Terjadi kesalahan pada server', statusCode = 500, errors = undefined) => {
  const payload = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse,
};
