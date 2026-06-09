import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const API_KEY = process.env.FOURSQUARE_API_KEY;

const response = await fetch(
  "https://places-api.foursquare.com/places/search?query=landmark&near=London&limit=10",
  {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "X-Places-Api-Version": "2025-06-17",
      accept: "application/json",
    },
  }
);

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
