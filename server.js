const app = require('./app');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
//
process.on('uncaughtException', (err) => {
  console.log('uncaughtException');
  console.log(err.name, err.message);
  process.exit(1);
});
//
dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;
//CONNECTING TO DB
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database Connected'));

//GETTING THE APP LIVE
const server = app.listen(port, () => {
  console.log('App is live on port:3000');
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
