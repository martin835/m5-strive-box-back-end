export const errorHandler = (err, req, res, next) => {
  if (err) {
    res.status(err.statusCode || 500).send(err);
  } else {
    next();
  }
};
