import express from "express";
import prismaClient from "../../utils/prismaClient";
import {getMembershipTypes, getRoles} from "./attributesModel";

const attributes = express.Router();

attributes.get("/roles/:detailed?", async (req, res) => {
    const detailed = req.params.detailed;

    const roles = await getRoles(detailed === "detailed");
    res.json(roles);
});

attributes.get("/membership_types", async (req, res) => {
   res.json(await getMembershipTypes());
});

export default attributes;