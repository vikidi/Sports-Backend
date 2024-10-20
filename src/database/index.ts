export {}; // This is to combat the TS2451 error

const mongoose = require("mongoose");

mongoose
  .connect(
    `${process.env.MONGODB_PREFIX}://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`
  )
  .catch((err) => console.log(err));

mongoose.connection.on("error", (err) => {
  console.log(err);
});
