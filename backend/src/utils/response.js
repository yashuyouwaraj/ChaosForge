const success = (res, data, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = "Error", code = 400) => {
  return res.status(code).json({
    success: false,
    message,
  });
};

module.exports = { success, error };