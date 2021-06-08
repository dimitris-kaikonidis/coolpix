const chalk = require("chalk");
const express = require("express");

//Routers
const imageAPI = require("./routers/imageAPI");
const comments = require("./routers/comments");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    next();
});

app.use(imageAPI);
app.use(comments);

if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));
}

module.exports = app;
