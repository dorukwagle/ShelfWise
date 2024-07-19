import express from "express";
import prismaClient from "../../utils/prismaClient";

const roles = express.Router();

roles.get("/", async (req, res) => {
    res.json(await prismaClient().userRoles.findMany());
});

export default roles;