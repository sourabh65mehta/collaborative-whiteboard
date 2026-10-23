import cors from "cors";
import express, { type Express } from "express";
import { authRouter } from "./auth/routes.js";
import { env } from "./env.js";

const app: Express = express();

app.use(express.json({ limit: "50kb" }));
app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});
