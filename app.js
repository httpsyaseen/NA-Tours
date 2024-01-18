const express = require('express');
const morgan = require('morgan');
//const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(morgan('dev'));
//app.use(bodyParser.urlencoded({ extended: true }));

const tourRoute = require('./routes/tourRouter');
const userRoute = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const myError = require('./controllers/errorController');

//ROUTES
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.all('*', (req, res, next) => {
  next(new AppError(`the ${req.url} is not available`, 404));
});

app.use(myError.globalError);

module.exports = app;
