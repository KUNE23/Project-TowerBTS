export const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendPaginated = (res, message, data, meta) => {
  res.json({
    success: true,
    message,
    data,
    meta,
  });
};
