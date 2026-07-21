import "dotenv/config";
import express from "express";
import path from "node:path";

const port = Number(process.env.ASSETS_PORT ?? 3100);

const app = express();

// Quote attachments are downloaded by the quotes crawler into public/quote-attachments.
// The web app relays /quote-attachments/* here (rewrite in its next.config.ts) for
// files it doesn't have in its own public directory.
app.use(
  "/quote-attachments",
  express.static(path.join(process.cwd(), "public/quote-attachments"), {
    // Attachment filenames embed the Discord message + attachment IDs, so they never change
    immutable: true,
    maxAge: "365d",
  }),
);

app.use((_req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.info(`Asset server listening on port ${port}.`);
});
