/**
 * Returns a base64 encoded string of the POLAR_CLIENT_ID and POLAR_CLIENT_SECRET
 * environment variables, separated by a colon. This is used to set the
 * Authorization header in HTTP requests to the Polar API.
 *
 * @returns {string} The base64 encoded string.
 */
export const getPolarAuthorization = (): string => {
  return Buffer.from(
    `${process.env.POLAR_CLIENT_ID}:${process.env.POLAR_CLIENT_SECRET}`
  ).toString("base64");
};
