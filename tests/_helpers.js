const mongoose = require("mongoose");
const axios = require("axios").default;
require("dotenv").config({ path: __dirname + "/./../.env.development.local" });

const Exercise = require("../src/models/exercise");

const exerciseData = require("./data/exercises.json");

/**
 * Clears database from all documents
 */
const clearDb = async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map(async (collection) => {
      await collection.deleteMany({}).catch((err) => console.log(err)); // an empty mongodb selector object ({}) must be passed as the filter argument
    })
  );
};

/**
 * Gets auth0 user data for test user
 * @param {String} scope Scope to retrieve
 * @returns {Promise<String>} Promise with user data
 */
const getUser = (scope) => {
  let postOptions = {
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

  if (scope) postOptions.data.scope = scope;

  return new Promise((resolve, reject) => {
    let token;
    axios
      .request(postOptions)
      .then((response) => {
        if (!response.data.access_token)
          return reject(new Error("No access token."));

        token = `${response.data.token_type} ${response.data.access_token}`;

        let getOptions = {
          method: "GET",
          url: process.env.AUTH_ISSUER + "userinfo",
          headers: {
            Authorization: token,
          },
        };

        return axios.request(getOptions);
      })
      .then((res) => {
        resolve({
          token: token,
          id: res.data.sub,
        });
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
const randomString = (len) => {
  let text = "";
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; ++i)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
};

/**
 * Get random mongodb ObjectId
 * @returns New random ObjectId
 */
const randomMongoId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Get random Auth0 user ID
 * @returns New random Auth0 user ID with auth0 prefix
 */
const randomAuth0Id = () => {
  return `auth0|${randomString(24)}`;
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
      return {
        ...override,
        _id: savedData._doc._id.toString(),
        createdAt: savedData._doc.createdAt?.toISOString(),
        updatedAt: savedData._doc.updatedAt?.toISOString(),
        // __v should be never returned
      };
    })
  );

  return data;
};

module.exports = {
  clearDb,
  getUser,
  randomString,
  randomMongoId,
  randomAuth0Id,
  saveExerciseMockData,
};
