const { connectMongoDB } = require("./mongodb");
const models = require("./models");

async function getDb() {
  await connectMongoDB();
  return models;
}

module.exports = {
  connectMongoDB,
  getDb,
  ...models,
};
