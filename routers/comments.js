const { addComment, getImageComments } = require("../utilities/db");
const express = require("express");
const router = express.Router();

router.get("/comments/:imageId", (req, res) => {
    const { imageId } = req.params;
    getImageComments(imageId)
        .then(result => res.json({ success: true, comments: result.rows }))
        .catch(error => console.log(error));
});

router.post("/comment", (req, res) => {
    const { comment, username, imageId } = req.body;
    addComment(comment, username, imageId)
        .then(result => res.json(result.rows[0]))
        .catch(error => console.log(error));
});

module.exports = router;