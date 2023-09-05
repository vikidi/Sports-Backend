const express = require("express");

const { create, myList, getOne } = require("../controllers/route");

const router = express.Router();

router.post("/create", async (req, res) => create(req, res));

router.get("/my-list", async (req, res) => myList(req, res));

router.get("/:id", async (req, res) => getOne(req, res));

module.exports = router;
