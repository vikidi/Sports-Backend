export {}; // This is to combat the TS2451 error

import { connect, connection } from "mongoose";
import { checkPolarApiConnection } from "../services/polar-webhook";

export function initDatabase() {
  // Tests will handle database and polar API connection separately
  if (process.env.NODE_ENV !== "test") {
    connect(
      `${process.env.MONGODB_PREFIX}://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`
    )
      .then(() => {
        checkPolarApiConnection();
      })
      .catch((err) => console.log(err));

    connection.on("error", (err) => {
      console.log(err);
    });
  }
}
