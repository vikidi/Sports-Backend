export {}; // This is to combat the TS2451 error

import axios from "axios";

import { getPolarAuthorization } from "../utils/polar";
import Connection from "../models/connection";

export const checkPolarApiConnection = async () => {
  const res = await axios.get("https://www.polaraccesslink.com/v3/webhooks", {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${getPolarAuthorization()}`,
    },
  });

  const connectionPolar = res.data.data;
  const connectionDb = await Connection.findById("polar-webhook");

  // Connection not found from polar API
  if (Array.isArray(connectionPolar) && !connectionPolar.length) {
    // Delete connection if found from DB
    if (connectionDb) {
      await Connection.deleteOne({ _id: "polar-webhook" });
    }

    // Request new connection from polar API
    const newConnectionRes = await axios.post(
      "https://www.polaraccesslink.com/v3/webhooks",
      {
        events: ["EXERCISE"],
        url: `${process.env.API_URL}/connections/polar-webhook`,
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${getPolarAuthorization()}`,
        },
      }
    );

    // Add the new connection to DB
    const newConnection = newConnectionRes.data.data;
    await Connection.create({
      _id: "polar-webhook",
      externalId: newConnection.id,
      events: newConnection.events,
      url: newConnection.url,
      signatureSecretKey: newConnection.signature_secret_key,
    });
  }

  // Connection found from polar API
  else {
    // No updating needed
    if (
      connectionPolar[0]?.url ===
        `${process.env.API_URL}/connections/polar-webhook` &&
      connectionDb?.url === `${process.env.API_URL}/connections/polar-webhook`
    ) {
      return;
    }

    console.log(connectionPolar);

    const axiosRes = await axios.patch(
      `https://www.polaraccesslink.com/v3/webhooks/${connectionPolar[0].id}`,
      {
        events: ["EXERCISE"],
        url: `${process.env.API_URL}/connections/polar-webhook`,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${getPolarAuthorization()}`,
        },
      }
    );

    const newConnection = axiosRes!.data.data;
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
  }
};
