import "express-async-errors";
import "dotenv/config";
import cors from "cors";
import express from "express";
import routes from "./routes";
import "./configs/database";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api", routes);

app.listen(process.env.PORT || 4000, () => {
  console.log("Server is running");
});
