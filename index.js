const express = require("express");
const app = express();
const port = 8080;

const transmisiRouter = require("./router/transmisi.js");
const kendaraanRouter = require("./router/kendaraan.js");

const bodyPs = require("body-parser");
app.use(bodyPs.urlencoded({ extended: false }));
app.use(bodyPs.json());

app.use("/api/transmisi", transmisiRouter);
app.use("/api/kendaraan", kendaraanRouter);

app.listen(port, () => {
  console.log(`aplikasi berjalan di http::/localhost:${port}`);
});
