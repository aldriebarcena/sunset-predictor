const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

// runs main.py and converts output to string
app.get("/run-command", (req, res) => {
  const agentops = spawn("python3.12", ["src/main.py"]); // Replace with your terminal command

  let output = "";

  agentops.stdout.on("data", (data) => {
    output += data.toString();
  });

  agentops.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  agentops.on("close", () => {
    res.json({ output });
  });
});

// saves location
app.post("/save-location", (req, res) => {
  const locationData = req.body;

  console.log("Received location data:", locationData);

  fs.readFile("src/data.js", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading data.js:", err);
      res.status(500).json({ error: "Error reading file" });
      return;
    }

    let jsonData = [];

    try {
      const jsonString = data.replace("var locations = ", "").trim();
      jsonData = jsonString ? JSON.parse(jsonString) : [];
    } catch (error) {
      jsonData = [];
    }

    jsonData.push(locationData);

    console.log("Updated JSON data:", jsonData);

    fs.writeFile(
      "src/data.js",
      `var locations = ${JSON.stringify(jsonData, null, 2)};`,
      (err) => {
        if (err) {
          console.error("Error writing to data.js:", err);
          res.status(500).json({ error: "Error writing to file" });
          return;
        }
        console.log("Location saved successfully");
        res.json({ message: "Location saved successfully" });
      }
    );
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
