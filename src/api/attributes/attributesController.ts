import express, {Request} from "express";
import {
    addAuthor,
    addGenre, addPublisher, deleteAuthor,
    deleteGenre, deletePublisher, getAuthors,
    getGenres,
    getMembershipTypes,
    getPublishers,
    getRoles, updateAuthor,
    updateGenre, updatePublisher
} from "./attributesModel";
import {FilterParamsType} from "../../validations/FilterParams";
import Genre from "../../validations/Genre";
import Publication from "../../validations/Publication";
import Author from "../../validations/Author";
import {assistantManagerAuth} from "../../middlewares/auth";
import SessionRequest from "../../entities/SessionRequest";
import formatValidationErrors from "../../utils/formatValidationErrors";


const attributes = express.Router();

attributes.get("/roles/:detailed?", async (req, res) => {
    const detailed = req.params.detailed;

    const roles = await getRoles(detailed === "detailed");
    res.json(roles);
});

attributes.get("/membership_types", async (req, res) => {
    res.json(await getMembershipTypes());
});

attributes.get("/genres",
    async (req: Request<any, any, any, FilterParamsType>, res) => {
        const {statusCode, data, error, info} = await getGenres(req.query);
        res.status(statusCode).json(error ? error : {data, info});
    });

attributes.post("/genres", assistantManagerAuth, async (req, res) => {
    const validation = Genre.safeParse(req.body);
    const err = formatValidationErrors(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);

    res.json(await addGenre(validation.data!.genre));
});

attributes.put("/genres/:genreId", assistantManagerAuth,
    async (req: SessionRequest<{ genreId: string }>, res) => {
        const validation = Genre.safeParse(req.body);
        const err = formatValidationErrors(validation);
        if (err)
            return res.status(err.statusCode).json(err.error);

        const response = await updateGenre(req.params.genreId, validation.data!.genre);
        res.status(response.statusCode).json(response.data);
    });

attributes.delete("/genres/:genreId", assistantManagerAuth,
    async (req: SessionRequest<{ genreId: string }>, res) => {
        const response = await deleteGenre(req.params.genreId);
        res.status(response.statusCode).json(response.data);
    });

// PUBLISHERS ROUTES

attributes.get("/publishers",
    async (req: Request<any, any, any, FilterParamsType>, res) => {
        const {statusCode, data, error, info} = await getPublishers(req.query);
        res.status(statusCode).json(error ? error : {data, info});
    });

attributes.post("/publishers", assistantManagerAuth, async (req, res) => {
    const validation = Publication.safeParse(req.body);
    const err = formatValidationErrors(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);

    const {publisherName, address} = validation.data!;
    res.json(await addPublisher(publisherName, address));
});

attributes.put("/publishers/:publisherId", assistantManagerAuth,
    async (req: SessionRequest<{ publisherId: string }>, res) => {
        const validation = Publication.safeParse(req.body);
        const err = formatValidationErrors(validation);
        if (err)
            return res.status(err.statusCode).json(err.error);

        const {publisherName, address} = validation.data!;
        const response = await updatePublisher(req.params.publisherId, publisherName, address);
        res.status(response.statusCode).json(response.data);
    });

attributes.delete("/publishers/:publisherId", assistantManagerAuth,
    async (req: SessionRequest<{ publisherId: string }>, res) => {
        const response = await deletePublisher(req.params.publisherId);
        res.status(response.statusCode).json(response.data);
    });

// AUTHORS ROUTES

attributes.get("/authors", async (req, res) => {
    const {statusCode, data, info, error} = await getAuthors(req.query);
    res.status(statusCode).json(error ? error : {data, info});
});

attributes.post("/authors", assistantManagerAuth, async (req, res) => {
    const validation = Author.safeParse(req.body);
    const err = formatValidationErrors(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);

    const {fullName, title} = validation.data!;
    res.json(await addAuthor(title, fullName));
});

attributes.put("/authors/:authorId", assistantManagerAuth,
    async (req: SessionRequest<{ authorId: string }>, res) => {
        const validation = Author.safeParse(req.body);
        const err = formatValidationErrors(validation);
        if (err)
            return res.status(err.statusCode).json(err.error);

        const {title, fullName} = validation.data!;
        const response = await updateAuthor(req.params.authorId, title, fullName);
        res.status(response.statusCode).json(response.data);
    });

attributes.delete("/authors/:authorId", assistantManagerAuth,
    async (req: SessionRequest<{ authorId: string }>, res) => {
        const response = await deleteAuthor(req.params.authorId);
        res.status(response.statusCode).json(response.data);
    });

export default attributes;