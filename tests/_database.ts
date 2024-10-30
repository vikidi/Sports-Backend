import mongoose from "mongoose";

/**
 * Connect to the test database.
 */
export const connect = async () => {
  await mongoose.connect(
    `mongodb://testadminuser:testadminpass@localhost:27020/tests?retryWrites=true&w=majority`
  );
};

/**
 * Drop database and close the connection.
 */
export const closeDatabase = async () => {
  await mongoose.connection.close();
};
