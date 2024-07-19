import express from "express";
import prismaClient from "../../utils/prismaClient";

const roles = express.Router();

roles.get("/", async (req, res) => {
    const data = await prismaClient().userRoles.findMany();
    const roles:{[key: string]: number} = {};
    for (const role of data)
        roles[role.role] = role.precedence;

    res.json(roles);
});

export default roles;