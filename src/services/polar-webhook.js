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
  .then(async (res) => {
    const connectionPolar = res.data.data;
    const connectionDb = await Connection.findById("polar-webhook");

    // Connection not found from polar API
    if (Array.isArray(connectionPolar) && !connectionPolar.length) {
      // Delete connection if found from DB
      if (connectionDb) {
        await Test.deleteById("polar-webhook");
      }

      // Request new connection from polar API
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

        // Add the new connection to DB
        .then(async (res) => {
          const newConnection = res.data.data;
          await Connection.create({
            _id: "polar-webhook",
            externalId: newConnection.id,
            events: newConnection.events,
            url: newConnection.url,
            signatureSecretKey: newConnection.signature_secret_key,
          });
        })
        .catch((err) => console.log(err.message));
    }

    // Connection found from polar API
    else {
      // No updating needed
      if (
        connectionPolar[0]?.url ===
          `${process.env.API_URL}/connection/polar-webhook` &&
        connectionDb?.url === `${process.env.API_URL}/connection/polar-webhook`
      ) {
        return;
      }

      axios
        .patch(
          `https://www.polaraccesslink.com/v3/webhooks/${connectionPolar[0].id}`,
          {
            events: ["EXERCISE"],
            url: `${process.env.API_URL}/connection/polar-webhook`,
          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Basic ${getPolarAuthorization()}`,
            },
          }
        )
        .then(async (res) => {
          const newConnection = res.data.data;
          // Create new connection to DB if not found
          if (!connectionDb) {
            await Connection.create({
              _id: "polar-webhook",
              externalId: newConnection.id,
              events: newConnection.events,
              url: newConnection.url,
              signatureSecretKey: newConnection.signature_secret_key,
            });
          }

          // Update connection in DB
          else {
            await Connection.findByIdAndUpdate("polar-webhook", {
              events: newConnection.events,
              url: newConnection.url,
            });
          }
        })
        .catch((err) => console.log(err.message));
    }
  })
  .catch((err) => console.log(err.message));
