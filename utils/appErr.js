const appErr = (message, statusCode) => {
  let err = new Error(message);
  err.stack = err.stack;
  err.statusCode = statusCode ? statusCode : 500;
  return err;
};

module.exports = appErr;
