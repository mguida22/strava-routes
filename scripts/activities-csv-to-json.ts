import fs from "fs";
import Papa from "papaparse";

const csvFilePath = "../data/export_38635085/activities.csv";
const jsonFilePath = "../public/activities.json";

Papa.parse(fs.createReadStream(csvFilePath), {
  header: true,
  // replace spaces in header with underscores
  transformHeader: (header) => header.toLowerCase().replace(/\s/g, "_"),
  complete: (results) => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(results.data));
  },
});
