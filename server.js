const mongoose = require('mongoose');
const dotenv = require('dotenv');
//cita nam config varijable i cuva ih kao nodejs enviorement variables

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
//stavlja password u password, glupo ali eto, u odvojenu varijablu
const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
//konekcija preko mongoose
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });

//da nam kaze u kojem smo modu (dev ili prod)
//console.log(process.env);

/*
//pravljenje dokumenta
const testTour = new Tour({
  name: 'The Park Camper',
  price: 997,
});
//cuvanje u Mongo
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('ERROR!', err);
  });
*/
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Server is up.');
});

//global code za sve unhandledRejection slucaje
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
