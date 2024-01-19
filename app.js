const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
//const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(morgan('dev'));
//app.use(bodyParser.urlencoded({ extended: true }));

const tourRoute = require('./routes/tourRouter');
const userRoute = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const myError = require('./controllers/errorController');

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too Many Requests..Please Try Again in an hour',
});

//ROUTES
app.use('/api', limiter);

app.use(mongoSanitize());
app.use(xss());
app.use(helmet());
app.use(
  hpp({
    whiteList: [
      'duration',
      'price',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);

app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.all('*', (req, res, next) => {
  next(new AppError(`the ${req.url} is not available`, 404));
});

app.use(myError.globalError);

module.exports = app;
