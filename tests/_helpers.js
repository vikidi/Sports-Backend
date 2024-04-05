const mongoose = require("mongoose");
const axios = require("axios").default;
require("dotenv").config({ path: __dirname + "/./../.env.development.local" });

const Exercise = require("../src/models/exercise");

const exerciseData = require("./data/exercises.json");

/**
 * Clears database from all documents
 */
const clearDb = async () => {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map(async (collection) => {
      await collection.deleteMany({}); // an empty mongodb selector object ({}) must be passed as the filter argument
    })
  );
};

/**
 * Gets auth0 token for test user
 * @param {String} scope Scope to retrieve
 * @returns {Promise<String>} Promise with scheme and token
 */
const getToken = (scope) => {
  let options = {
    method: "POST",
    url: process.env.AUTH_ISSUER + "oauth/token",
    data: {
      grant_type: "password",
      username: process.env.TEST_AUTH_USER,
      password: process.env.TEST_AUTH_PASS,
      audience: process.env.AUTH_AUDIENCE,
      client_id: process.env.AUTH_CLIENT_ID,
      client_secret: process.env.AUTH_CLIENT_SECRET,
    },
  };

  if (scope) options.data.scope = scope;

  return new Promise((resolve, reject) => {
    axios
      .request(options)
      .then((response) => {
        if (!response.data.access_token)
          return reject(new Error("No access token."));
        resolve("Bearer " + response.data.access_token);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * Generate random string
 * @param {Number} len Length of the string to be generated
 * @returns Generated string
 */
const stringGen = (len) => {
  let text = "";
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; ++i)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
};

/**
 * Saves valid mock exercise data into database
 * @param {Number} n How many exercises to save
 * @param {Array<Object>} overrideData Array of objects to override partially or fully the default mock data
 * @returns {Promise<Object[]>} Saved data in an array
 */
const saveExerciseMockData = async (n, overrideData) => {
  if (n > exerciseData.length)
    throw new Error("Too many exercises requested with param 'n'");

  let data = await Promise.all(
    (n ? exerciseData.slice(0, n) : exerciseData).map(async (data, i) => {
      let override = { ...data, ...overrideData?.[i] };
      let savedData = await new Exercise(override).save();
      return savedData._doc;
    })
  );

  return data;
};

module.exports = {
  clearDb,
  getToken,
  stringGen,
  saveExerciseMockData,
};
