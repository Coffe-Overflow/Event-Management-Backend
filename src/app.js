const express = require("express");
const cors = require("cors");
const eventsRouter = require("./routes/events.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/events", eventsRouter);

// handler simplu pentru 404
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

module.exports = app;
