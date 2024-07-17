import fs from "fs";

const data = fs.readFileSync("data/activity.json", "utf8");
const { resting, privacy, latlng } = JSON.parse(data);

console.log(latlng[0]);
