const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const myError = require('./controllers/errorController');

const app = express();

app.use(cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

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

//everything working now
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'default-src': ["'self'"],
      'connect-src': ["'self'", "'unsafe-inline'", 'ws://127.0.0.1:*'],
      'img-src': ["'self'", 'data:'],
      'style-src-elem': ["'self'", 'data:', 'https://fonts.googleapis.com'],
      'script-src': ["'unsafe-inline'", "'self'"],
      'object-src': ["'none'"],
    },
  }),
);

//bundler working

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       'default-src': ["'self'"],
//       'connect-src': ["'self'", "'unsafe-inline'", 'ws://127.0.0.1:51499'],
//       'img-src': ["'self'", 'data:'],
//       'style-src-elem': ["'self'", 'data:'],
//       'script-src': ["'unsafe-inline'", "'self'"],
//       'object-src': ["'none'"],
//     },
//   }),
// );

//Don't Remember
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       'default-src': ["'self'"],
//       'connect-src': ["'self'", "'unsafe-inline'"],
//       'img-src': ["'self'", 'data:'],
//       'style-src-elem': ["'self'", 'data:'],
//       'script-src': ["'unsafe-inline'", "'self'"],
//       'object-src': ["'none'"],
//     },
//   }),
// );

//Simple axios Working

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:'],

//       fontSrc: ["'self'", 'https:', 'data:'],

//       scriptSrc: ["'self'", 'unsafe-inline'],

//       scriptSrc: ["'self'", 'https://*.cloudflare.com'],

//       scriptSrcElem: ["'self'", 'https:', 'https://*.cloudflare.com'],

//       styleSrc: [
//         "'self'",
//         'https:',
//         'unsafe-inline',
//         'nonce-',
//         'unsafe-hashes',
//       ],

//       connectSrc: ["'self'", 'data', 'https://*.cloudflare.com'],
//     },
//   }),
// );

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

// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });
//3) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`the ${req.url} is not available`, 404));
});

app.use(myError.globalError);

module.exports = app;
