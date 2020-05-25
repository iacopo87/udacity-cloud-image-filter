import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { deleteLocalFiles, filterImageFromURL } from "./util/util";

(async () => {
  // Init the Express application
  let app = express();

  // Set the network port
  const port = process.env.PORT || 8080;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Add an endpoint to GET a specific resource by Primary Key
  app.get("/filteredimage", async (req: Request, res: Response) => {
    const { image_url } = req.query;
    let filterdImagePath: string;

    if (!image_url) {
      return res.status(422).send(`image_url is required`);
    }

    try {
      filterdImagePath = await filterImageFromURL(image_url);
    } catch (e) {
      res.status(400).send(`the image_url is not a valid image URL`);
    }

    res
      .status(200)
      .sendFile(filterdImagePath, () => deleteLocalFiles([filterdImagePath]));
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
