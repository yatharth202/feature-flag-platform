import express from "express"
import cors from "cors"
import featureFlagRoutes from "./routes/featureFlag.routes.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

app.use("/api/v1/feature-flags", featureFlagRoutes);

app.get("/", (req, res) => {
  res.send("Feature Flag API is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy"
  });
});

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err);
  }

  return res.status(500).json(
    new ApiError(500, "Internal Server Error")
  );
});

export default app;
