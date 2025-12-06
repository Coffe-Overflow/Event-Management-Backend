const express = require("express");
const cors = require("cors");
const eventsRouter = require("./routes/events.routes");
const organizersRouter = require("./routes/organizers.routes"); 
const utilityRouter = require("./routes/utility.routes"); 

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/events", eventsRouter);
app.use("/api/organizers", organizersRouter);
app.use("/api/utils", utilityRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

module.exports = app;
