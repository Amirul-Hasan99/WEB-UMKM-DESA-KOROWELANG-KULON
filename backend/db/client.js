const { connectMongoDB } = require("./mongodb");
const models = require("./models");
const localDb = require("./local_db");

/**
 * Database Helper Object combining MongoDB Mongoose models and Local Storage Fallback
 */
async function getDb() {
  const conn = await connectMongoDB();
  if (conn) {
    return { isMongo: true, ...models };
  }
  return { isMongo: false, localDb };
}

module.exports = {
  connectMongoDB,
  getDb,
  ...models,
};
