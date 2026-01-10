const express = require("express");
const cors = require("cors");
const path = require("path"); 

const eventsRouter = require("./routes/events.routes");
const organizersRouter = require("./routes/organizers.routes");
const utilityRouter = require("./routes/utility.routes"); 
const authRouter = require("./routes/auth.routes"); 
const adminRouter = require("./routes/admin.routes"); 

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/events", eventsRouter);
app.use("/api/organizer", organizersRouter);

const testRouter = express.Router();
testRouter.get('/test', (req, res) => res.status(200).send('Router de Test OK'));
app.use("/api/utility", testRouter);

app.use("/api/auth", authRouter); 
app.use("/api/admin", adminRouter); 

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

module.exports = app;
