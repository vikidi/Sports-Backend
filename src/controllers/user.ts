export {}; // This is to combat the TS2451 error

const axios = require("axios");

const User = require("../models/user");

const { getPolarAuthorization } = require("../utils");

const getSelf = (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      if (user === null)
        return res.status(404).json({ errors: ["User not found."] });

      res.json({
        polarConnected:
          user.polarToken !== undefined && user.polarConnected !== "",
      });
    })
    .catch((err) =>
      res.status(err.status ?? 500).json({ errors: [err.message] })
    );
};

const create = (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      if (user !== null) return;

      return User.create({
        _id: req.user.id,
      });
    })
    .then(() => res.status(200).json())
    .catch((err) =>
      res.status(err.status ?? 500).json({ errors: [err.message] })
    );
};

const polarToken = (req, res) => {
  axios
    .post(
      "https://polarremote.com/v2/oauth2/token",
      { grant_type: "authorization_code", code: req.body.code },
      {
        headers: {
          Authorization: `Basic ${getPolarAuthorization()}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json;charset=UTF-8",
        },
      }
    )
    .then((result) => {
      let t = new Date();
      t.setSeconds(t.getSeconds() + result.data.expires_in);

      return User.findByIdAndUpdate(
        req.user.id,
        {
          polarId: result.data.x_user_id,
          polarToken: result.data.access_token,
          polarTokenCreatedAt: Date.now(),
          polarTokenExpiresAt: t,
        },
        { returnDocument: "after" }
      );
    })
    .then((user) => {
      return axios.post(
        "https://www.polaraccesslink.com/v3/users",
        { "member-id": `${user.polarId}` },
        {
          headers: {
            Authorization: `Bearer ${user.polarToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    })
    .then((resp) => {
      return User.findByIdAndUpdate(req.user.id, {
        polarMemberId: resp.data["member-id"],
      });
    })
    .then(() => res.status(200).json())
    .catch((err) => {
      return res.status(err.status ?? 500).json({ errors: [err.message] });
    });
};

module.exports = {
  getSelf,
  create,
  polarToken,
};
