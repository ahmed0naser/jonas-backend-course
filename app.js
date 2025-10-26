const helmet = require("helmet");
const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/ToursRoutes");
const userRouter = require("./routes/UserRoutes");
const reviewRouter = require("./routes/ReviewRoutes");
const AppError = require("./utils/AppError");
const errHandler = require("./controllers/errorController");
const { login } = require("./controllers/authController");
const rateLimit = require("express-rate-limit");
const mongosanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const limiter = rateLimit({
  max: 100, //requests
  windowMS: 60 * 60 * 1000, //in one hour,
  message: "too many requests from your IP try again later",
});

app.use("/api", limiter);
app.use(express.json({ limit: "150kb" }));
//data sanitization agains noSql injection and XSS
app.use(mongosanitize());

app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "difficulty",
      "price",
      "ratingQuantity",
      "ratingAverage",
    ],
  })
);

app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `can't find this ${req.originalUrl} in this site!`,
  // });
  // const err = new Error(`can't find this ${req.originalUrl} in this site!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // const err=new Error(`can't find this ${req.originalUrl} in this site!`);
  // err.status='fail';
  // err.statusCode=404;
  // next(err)

  next(new AppError(`can't find ${req.originalUrl} in this site!`, 404));
});

// app.use((err, req, res, next) => {
//   console.log(err.stack);

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });------>moved to error controller file
app.use(errHandler);

module.exports = app;
