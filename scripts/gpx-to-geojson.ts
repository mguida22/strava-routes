import fs from "fs";
import { JSDOM } from "jsdom";

/** Converts a GPX file to a GeoJSON file. Expects a GPX file formatted
 * in the way Strava exports them, and preserves elevation and time on each point.
 */
async function convertGpxToGeoJson(
  gpxFilePath: string,
  geoJsonFilePath: string
) {
  const gpxData = fs.readFileSync(gpxFilePath, "utf-8");

  const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: "FeatureCollection",
    features: [],
  };

  const { window } = new JSDOM(gpxData, { contentType: "text/xml" });

  const trkElements = window.document.getElementsByTagName("trk");
  for (let trkElement of trkElements) {
    const trksegElements = trkElement.getElementsByTagName("trkseg");
    for (let trksegElement of trksegElements) {
      const trkptElements = trksegElement.getElementsByTagName("trkpt");
      for (let trkptElement of trkptElements) {
        const latAttr = trkptElement.getAttribute("lat");
        const lonAttr = trkptElement.getAttribute("lon");

        if (latAttr === null || lonAttr === null) {
          continue;
        }

        const lat = parseFloat(latAttr);
        const lon = parseFloat(lonAttr);
        const ele = Number(
          trkptElement.getElementsByTagName("ele")[0]?.textContent
        );
        const time = trkptElement.getElementsByTagName("time")[0]?.textContent;

        const feature: GeoJSON.Feature<GeoJSON.Point> = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
          properties: {
            ele,
            time,
          },
        };

        featureCollection.features.push(feature);
      }
    }
  }

  window.close();

  return new Promise((resolve) => {
    fs.writeFile(geoJsonFilePath, JSON.stringify(featureCollection), resolve);
  });
}

function getAllGpxFiles() {
  const dataDir = "../data/activities";
  return fs.readdirSync(dataDir).filter((file) => file.endsWith(".gpx"));
}

function getAllGeoJsonFiles() {
  const publicDir = "../public/activities";
  return fs.readdirSync(publicDir).filter((file) => file.endsWith(".json"));
}

const gpxFiles = getAllGpxFiles();
const geoJsonFiles = getAllGeoJsonFiles();
const filesToConvert = gpxFiles.filter((gpxFile) => {
  const geoJsonFile = gpxFile.replace(".gpx", ".json");
  return !geoJsonFiles.includes(geoJsonFile);
});

console.log(`Converting ${filesToConvert.length} files...`);

for (let [i, gpxFile] of filesToConvert.entries()) {
  const gpxFilePath = `../data/activities/${gpxFile}`;
  const geoJsonFilePath = `../public/activities/${gpxFile.replace(
    ".gpx",
    ".json"
  )}`;

  await convertGpxToGeoJson(gpxFilePath, geoJsonFilePath);
  console.log(
    `(${i + 1}/${filesToConvert.length}) | ${gpxFile.replace(".gpx", "")}`
  );
}
