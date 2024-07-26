import express, {Request} from "express";
import {getGenres, getMembershipTypes, getRoles} from "./attributesModel";
import {FilterParamsType} from "../../validations/FilterParams";


const attributes = express.Router();

attributes.get("/roles/:detailed?", async (req, res) => {
    const detailed = req.params.detailed;

    const roles = await getRoles(detailed === "detailed");
    res.json(roles);
});

attributes.get("/membership_types", async (req, res) => {
   res.json(await getMembershipTypes());
});

attributes.get("/genres", async (req: Request<any, any, any, FilterParamsType>, res) => {
    const {statusCode, data, error, info} = await getGenres(req.query);
    res.status(statusCode).json(error ? error : {data, info});
});

export default attributes;