// gets latitude and longitude from user and updates data.js
document
  .getElementById("locationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const longitude = document.getElementById("longitude").value;
    const latitude = document.getElementById("latitude").value;

    const locationData = {
      latitude: latitude,
      longitude: longitude,
    };

    fetch("/save-location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(locationData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

// receives output from main.py and converts to html
document
  .getElementById("generateButton")
  .addEventListener("click", async () => {
    const outputDiv = document.getElementById("output");

    outputDiv.style.visibility = "visible";
    outputDiv.innerHTML = '<div class="loading">Loading...</div>';

    try {
      const response = await fetch("/run-command");
      const result = await response.json();

      const regex = /```json([\s\S]*?)```/g;
      const matches = [...result.output.matchAll(regex)];

      let targetData = null;
      for (const match of matches) {
        const jsonString = match[1].trim();
        const parsedData = JSON.parse(jsonString);

        if (parsedData.ID === 1) {
          targetData = parsedData;
          break;
        }
      }

      if (targetData) {
        outputDiv.innerHTML = `
        <div class="city-name">${targetData.city || "N/A"}</div>
        <div class="quality"><span class="label">Sunset Quality:</span> ${
          targetData.sunset_quality_percentage || "N/A"
        }%</div>
        <div class="explanation">${targetData.explanation || "N/A"}</div>
        <div class="confidence"><span class="label">Confidence Level:</span> ${
          targetData.confidence_level || "N/A"
        }</div>
      `;
      } else {
        outputDiv.innerHTML =
          '<div class="error">Error: Could not find JSON with ID: 1.</div>';
      }
    } catch (error) {
      outputDiv.innerHTML =
        '<div class="error">An error occurred while fetching the data.</div>';
      console.error(error);
    }
  });
