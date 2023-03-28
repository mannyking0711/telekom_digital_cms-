require('dotenv').config();
const { migrate } = require('./migrate');

async function f(config) {
  await migrate(config);
  process.exit();
}

f();
