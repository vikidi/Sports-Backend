export {}; // This is to combat the TS2451 error

import { connect, connection } from "mongoose";

connect(
  `${process.env.MONGODB_PREFIX}://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`
).catch((err) => console.log(err));

connection.on("error", (err) => {
  console.log(err);
});
