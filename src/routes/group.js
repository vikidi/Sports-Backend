const express = require("express");

const { create, myList } = require("../controllers/group");

const router = express.Router();

router.post("/create", async (req, res) => create(req, res));

router.get("/my-list", async (req, res) => myList(req, res));

module.exports = router;
