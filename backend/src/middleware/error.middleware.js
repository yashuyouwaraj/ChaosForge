const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (err.code) {
    response.code = err.code;
  }

  if (err.details) {
    response.details = err.details;
  }

  res.status(err.status || err.statusCode || 500).json(response);
};

module.exports = errorHandler;
