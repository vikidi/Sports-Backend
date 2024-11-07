import axios, { AxiosResponse } from "axios";
import { getPolarAuthorization } from "../utils/polar";

export const POLAR_BASE_URL = "https://www.polaraccesslink.com/v3/webhooks";

/**
 * Fetches the webhook connection from the Polar API.
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const fetchWebhook = async (): Promise<AxiosResponse> => {
  return axios.get(POLAR_BASE_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${getPolarAuthorization()}`,
    },
  });
};

/**
 * Requests a webhook connection from the Polar API.
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const requestWebhook = async (): Promise<AxiosResponse> => {
  return axios.post(
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

/**
 * Deletes a webhook connection from the Polar API using the specified ID.
 * @param webhookId {string} The ID of the webhook connection to delete.
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const deleteWebhook = async (
  webhookId: string
): Promise<AxiosResponse> => {
  return axios.delete(`${POLAR_BASE_URL}/${webhookId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${getPolarAuthorization()}`,
    },
  });
};

/**
 * Updates the URL and events of an existing webhook connection in the Polar API.
 *
 * @param {string} webhookId - The ID of the webhook connection to update.
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const updateWebhookUrl = async (
  webhookId: string
): Promise<AxiosResponse> => {
  return axios.patch(
    `${POLAR_BASE_URL}/${webhookId}`,
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
