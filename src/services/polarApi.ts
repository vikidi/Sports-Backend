import axios, { AxiosResponse } from "axios";
import { getPolarAuthorization } from "../utils/polar";

export const POLAR_BASE_URL = "https://www.polaraccesslink.com/v3/webhooks";

/**
 * Fetches the webhook connection from the Polar API.
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const fetchWebhook = (): Promise<AxiosResponse> => {
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
export const requestWebhook = (): Promise<AxiosResponse> => {
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
export const deleteWebhook = (webhookId: string): Promise<AxiosResponse> => {
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
export const updateWebhookUrl = (webhookId: string): Promise<AxiosResponse> => {
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

/**
 * Activates a webhook connection in the Polar API.
 *
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const activateWebhook = (): Promise<AxiosResponse> => {
  return axios.post(
    `${POLAR_BASE_URL}/activate`,
    {},
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${getPolarAuthorization()}`,
      },
    }
  );
};

/**
 * Deactivates a webhook connection in the Polar API.
 *
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const deactivateWebhook = (): Promise<AxiosResponse> => {
  return axios.post(
    `${POLAR_BASE_URL}/deactivate`,
    {},
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${getPolarAuthorization()}`,
      },
    }
  );
};

/**
 * Requests an access token from the Polar API using the specified authorization code.
 *
 * @param {string} authorizationCode - The authorization code to exchange for an access token.
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const getUserToken = (
  authorizationCode: string
): Promise<AxiosResponse> => {
  return axios.post(
    "https://polarremote.com/v2/oauth2/token",
    { grant_type: "authorization_code", code: authorizationCode },
    {
      headers: {
        Authorization: `Basic ${getPolarAuthorization()}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json;charset=UTF-8",
      },
    }
  );
};

/**
 * Registers the user with the specified Polar ID on the Polar API.
 *
 * @param {number} polarId - The Polar user ID.
 * @param {string} polarToken - The access token obtained from the Polar API.
 * @returns {Promise<AxiosResponse>} The response from the Polar API.
 */
export const registerUser = (
  polarId: number,
  polarToken: string
): Promise<AxiosResponse> => {
  return axios.post(
    "https://www.polaraccesslink.com/v3/users",
    { "member-id": `${polarId}` },
    {
      headers: {
        Authorization: `Bearer ${polarToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
};
