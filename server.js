const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection');

  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.log('uncaugh exception');

  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DB_PASSWORD
).replace('<db_username>', process.env.DB_USERNAME);
mongoose.connect(DB).then((con) => console.log('DB connected'));

const port = process.env.PORT || 3000;
console.log('🧭 Running in:', process.env.NODE_ENV);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
