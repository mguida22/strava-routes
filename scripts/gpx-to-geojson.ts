import fs from "fs";
import { JSDOM } from "jsdom";

/** Converts a GPX file to a GeoJSON file. Expects a GPX file formatted
 * in the way Strava exports them, and preserves elevation and time on each point.
 */
function convertGpxToGeoJson(gpxFilePath: string, geoJsonFilePath: string) {
  const gpxData = fs.readFileSync(gpxFilePath, "utf-8");

  const geoJson = {
    type: "FeatureCollection",
    features: [] as GeoJSON.Feature[],
  };

  const { document } = new JSDOM(gpxData, { contentType: "text/xml" }).window;

  const trkElements = document.getElementsByTagName("trk");
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
        const feature: GeoJSON.Feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
          properties: {
            ele: trkptElement.getElementsByTagName("ele")[0]?.textContent,
            time: trkptElement.getElementsByTagName("time")[0]?.textContent,
          },
        };

        geoJson.features.push(feature);
      }
    }
  }

  fs.writeFileSync(geoJsonFilePath, JSON.stringify(geoJson));

  console.log("Conversion complete!");
}

const gpxFilePath = "../data/2256095162.gpx";
const geoJsonFilePath = "../data/2256095162.geojson";
convertGpxToGeoJson(gpxFilePath, geoJsonFilePath);
