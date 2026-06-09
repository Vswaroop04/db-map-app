export {};

const response = await fetch(
  "https://nominatim.openstreetmap.org/search?q=landmark+London&format=json&limit=10",
  {
    headers: {
      "User-Agent": "api-test",
    },
  }
);

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
