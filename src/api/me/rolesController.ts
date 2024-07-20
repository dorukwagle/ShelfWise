import express from "express";
import prismaClient from "../../utils/prismaClient";

const roles = express.Router();

roles.get("/:detailed?", async (req, res) => {
    const data = await prismaClient.userRoles.findMany();
    if (req.params.detailed) return res.json(data);

    const roles:{[key: string]: number} = {};
    for (const role of data)
        roles[role.role] = role.precedence;

    res.json(roles);
});

export default roles;