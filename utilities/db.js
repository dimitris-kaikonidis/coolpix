const spicedPG = require('spiced-pg');

const db = spicedPG(process.env.DATABASE_URL || "postgres:dim107:postgres@localhost:5432/imageboard");

module.exports.getImages = () => db.query(`SELECT * FROM images`);