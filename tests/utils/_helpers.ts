import mongoose from "mongoose";
import axios from "axios";
import Exercise from "../../src/models/exercise";
import Group from "../../src/models/group";
import exerciseData from "../data/exercises.json";
import groupData from "../data/groups.json";
import { Auth0User } from "../common/types";

let auth0User: Auth0User;

/**
 * Get Auth0 user id and token. Uses cache.
 * @returns Auth0 user id and token
 */
export const getAuth0User = async () => {
  if (!auth0User) auth0User = await getUser("openid");

  return auth0User;
};

/**
 * Clears database from all documents
 */
export const clearDb = async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map(async (collection) => {
      await collection.deleteMany({}).catch((err) => console.log(err)); // an empty mongodb selector object ({}) must be passed as the filter argument
    })
  );
};

/**
 * Gets auth0 user data for test user
 * @param scope Scope to retrieve
 * @returns Promise with user data
 */
export const getUser = (scope: string): Promise<Auth0User> => {
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
      scope: scope,
    },
  };

  return new Promise(async (resolve, reject) => {
    const response = await axios.request(postOptions);

    if (!response.data.access_token)
      return reject(new Error("No access token."));

    const token = `${response.data.token_type} ${response.data.access_token}`;

    let getOptions = {
      method: "GET",
      url: process.env.AUTH_ISSUER + "userinfo",
      headers: {
        Authorization: token,
      },
    };

    const res = await axios.request(getOptions);

    resolve({
      token: token,
      id: res.data.sub,
    });
  });
};

/**
 * Generate random string
 * @param len Length of the string to be generated
 * @returns Generated string
 */
export const randomString = (len: number): string => {
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
export const randomMongoId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Get random Auth0 user ID
 * @returns New random Auth0 user ID with auth0 prefix
 */
export const randomAuth0Id = () => {
  return `auth0|${randomString(24)}`;
};

/**
 * Saves valid mock exercise data into database
 * @param n How many exercises to save
 * @param overrideData Array of objects to override partially or fully the default mock data
 * @returns Saved data in an array
 */
export const saveExerciseMockData = async (n: number, overrideData: any) => {
  if (n > exerciseData.length)
    throw new Error("Too many exercises requested with param 'n'");

  let data = await Promise.all(
    (n ? exerciseData.slice(0, n) : exerciseData).map(
      async (data: any, i: number) => {
        let override = { ...data, ...overrideData?.[i] };
        let savedData = await new Exercise(override).save();
        return {
          ...override,
          _id: savedData._id.toString(),
          createdAt: savedData.createdAt?.toISOString(),
          updatedAt: savedData.updatedAt?.toISOString(),
          // __v should be never returned
        };
      }
    )
  );

  return data;
};

/**
 * Saves valid mock group data into database
 * @param n How many groups to save
 * @param overrideData Array of objects to override partially or fully the default mock data
 * @returns Saved data in an array
 */
export const saveGroupMockData = async (n: number, overrideData: any) => {
  if (n > groupData.length)
    throw new Error("Too many groups requested with param 'n'");

  let data = await Promise.all(
    (n ? groupData.slice(0, n) : groupData).map(
      async (data: any, i: number) => {
        let override = { ...data, ...overrideData?.[i] };
        let savedData = await new Group(override).save();
        return {
          ...override,
          _id: savedData._id.toString(),
          createdAt: savedData.createdAt?.toISOString(),
          updatedAt: savedData.updatedAt?.toISOString(),
          // __v should be never returned
        };
      }
    )
  );

  return data;
};
