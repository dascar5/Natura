const path = require('path');
const express = require('express');
const app = express();
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const cookieParser = require('cookie-parser');

//define view engine (template)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//1) GLOBAL MIDDLEWARE

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  //za logging
}
//zato sto je logicno logging koristiti samo u developmentu

//rate limiter za anti ddos i brute force (100 requests in 1 hour max)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//middleware - function that can modify incoming request data
//ovo nam daje da pristupamo static fajlovima sa PC-ja
//u addressbar ne moram da kucam /public/overview.html jer je
//public vec definisan kao root, pa je samo /overview.html dovoljno

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//data sanitization against NoSQL query injection
//filteruje sve $ i . jer se ne moze pokrenut query bez toga
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//sad pravimo nasu middleware funkciju
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next(); //ovo mora da bi se zavrsio req/res cycle
// });

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
//da nam middleware izbaci trenutno vrijeme

//3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//global error handling middleware (utils, controllers)
app.use(globalErrorHandler);

module.exports = app;
