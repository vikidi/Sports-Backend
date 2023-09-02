const mongoose = require("mongoose");

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_CLUSTER}.pfuaaom.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority`
  )
  .catch((err) => console.log(err));

mongoose.connection.on("error", (err) => {
  console.log(err);
});
