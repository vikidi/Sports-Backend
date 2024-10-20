export {}; // This is to combat the TS2451 error

const express = require("express");

const { create, myList, getOne, deleteOne } = require("../controllers/route");

const router = express.Router();

router.post("/create", async (req, res) => create(req, res));

router.get("/my-list", async (req, res) => myList(req, res));

router.get("/:id", async (req, res) => getOne(req, res));

router.delete("/:id", async (req, res) => deleteOne(req, res));

module.exports = router;
