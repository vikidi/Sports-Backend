const axios = require("axios");

const { getPolarAuthorization } = require("../utils");
const Connection = require("../models/connection");

axios
  .get("https://www.polaraccesslink.com/v3/webhooks", {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${getPolarAuthorization()}`,
    },
  })
  .then((res) => {
    const connection = res.data.data;
    if (Array.isArray(connection) && !connection.length) {
      axios
        .post(
          "https://www.polaraccesslink.com/v3/webhooks",
          {
            events: ["EXERCISE"],
            url: `${process.env.API_URL}/connection/polar-webhook`,
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Basic ${getPolarAuthorization()}`,
            },
          }
        )
        .then((res) => {
          const newConnection = res.data.data;
          Connection.create({
            _id: "polar-webhook",
            externalId: newConnection.id,
            events: newConnection.events,
            url: newConnection.url,
            signatureSecretKey: newConnection.signature_secret_key,
          });
        })
        .catch((err) => console.log(err.message));
    }
  })
  .catch((err) => console.log(err.message));
