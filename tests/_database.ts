const mongoose = require("mongoose");

/**
 * Connect to the test database.
 */
const connect = async () => {
  await mongoose.connect(
    `mongodb://testadminuser:testadminpass@localhost:27020/tests?retryWrites=true&w=majority`
  );
};

/**
 * Drop database and close the connection.
 */
const closeDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = {
  connect,
  closeDatabase,
};
