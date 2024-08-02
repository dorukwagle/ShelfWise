import express from "express";
import {memberAuth} from "../../middlewares/auth";

const booksController = express.Router();

booksController.get("/", memberAuth, async (req, res) => {

});

booksController.post("/", memberAuth, async (req, res) => {
    //check for cover photo
    //check if barcodes.length equals totalPieces
});

export default booksController;