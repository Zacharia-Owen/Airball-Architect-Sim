import express from "express";
import gameRoutes from "./api/gameRoutes";

const app = express();

app.use(express.json());
app.use("/games", gameRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});