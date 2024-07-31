import express, {Request} from "express";
import {
    addGenre, addPublisher,
    deleteGenre, deletePublisher,
    getGenres,
    getMembershipTypes,
    getPublishers,
    getRoles,
    updateGenre, updatePublisher
} from "./attributesModel";
import {FilterParamsType} from "../../validations/FilterParams";
import Genre from "../../validations/Genre";
import Publication from "../../validations/Publication";


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

attributes.post("/genres", async (req, res) => {
    const validation = Genre.safeParse(req.body);
    if (validation.error?.isEmpty)
        return res.status(400).json({ error: validation.error!.message });

    res.json(await addGenre(validation.data!.genre));
});

attributes.put("/genres/:genreId", async (req, res) => {
    const validation = Genre.safeParse(req.body);
    if ((validation.error))
        return res.status(400).json({ error: validation.error!.message });

    const response = await updateGenre(req.params.genreId, validation.data!.genre);
    res.status(response.statusCode).json(response.data);
});

attributes.delete("/genres/:genreId", async (req, res) => {
    const response = await deleteGenre(req.params.genreId);
    res.status(response.statusCode).json(response.data);
});

// PUBLISHERS ROUTES

attributes.get("/publishers", async (req: Request<any, any, any, FilterParamsType>, res) => {
    const {statusCode, data, error, info} = await getPublishers(req.query);
    res.status(statusCode).json(error ? error : {data, info});
});

attributes.post("/publishers", async (req, res) => {
    const validation = Publication.safeParse(req.body);
    if (validation.error)
        return res.status(400).json({ error: validation.error!.message });

    const {publisherName, address} = validation.data!;
    res.json(await addPublisher(publisherName, address));
});

attributes.put("/publishers/:publisherId", async (req, res) => {
    const validation = Publication.safeParse(req.body);
    if (validation.error?.isEmpty)
        return res.status(400).json({ error: validation.error!.message });

    const response = await updatePublisher(req.params.publisherId, validation.data!.publisherName);
    res.status(response.statusCode).json(response.data);
});

attributes.delete("/publishers/:publisherId", async (req, res) => {
    const response = await deletePublisher(req.params.publisherId);
    res.status(response.statusCode).json(response.data);
});

// AUTHORS ROUTES

export default attributes;