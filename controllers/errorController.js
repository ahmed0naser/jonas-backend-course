const AppError = require('./../utils/AppError');

const handleCastErrorDB = (err) => {
  const msg = `Invalid ${err.path}:${err.value}`;
  return new AppError(msg, 400);
};

const handleDuplicteErrorDB = (err) => {
  const val = err.errmsg.match(/"([^"]*)"/)[0];
  const msg = `Duplicate field value:${val} please use accepted value`;
  return new AppError(msg, 400);
};

const handleValidationErrorDB = (err) => {
  const errs = Object.values(err.errors).map((el) => el.message);
  const msg = `Invalid input data: ${errs.join('. ')}`;
  return new AppError(msg, 400);
};

const handleJWTError = () => next(new AppError('Invalid token', 401));
const handleJWTExpired = () => next(new AppError('token expired', 401));

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //log the error

    console.error(err);

    //send genric message
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'ERROR';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicteErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, res);
  }
};
