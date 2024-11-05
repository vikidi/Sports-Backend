import axios from "axios";
import { getPolarAuthorization } from "../utils/polar";

const POLAR_BASE_URL = "https://www.polaraccesslink.com/v3/webhooks";

export const getWebhook = async () => {
  return await axios.get(POLAR_BASE_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${getPolarAuthorization()}`,
    },
  });
};

export const requestWebhook = async () => {
  return await axios.post(
    POLAR_BASE_URL,
    {
      events: ["EXERCISE"],
      url: `${process.env.API_URL}/api/public/connections/polar-webhook`,
    },
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${getPolarAuthorization()}`,
      },
    }
  );
};

export const deleteWebhook = async (id: string) => {
  return await axios.delete(`${POLAR_BASE_URL}/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${getPolarAuthorization()}`,
    },
  });
};

export const patchWebhookUrl = async (id: string) => {
  return await axios.patch(
    `${POLAR_BASE_URL}/${id}`,
    {
      events: ["EXERCISE"],
      url: `${process.env.API_URL}/api/public/connections/polar-webhook`,
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${getPolarAuthorization()}`,
      },
    }
  );
};
