import express from "express";
import gameRoutes from "./api/gameRoutes";

const app = express();

app.use(express.json());
app.use("/games", gameRoutes);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});