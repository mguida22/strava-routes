/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/spf13/cobra"
)

type Properties struct {
	Ele  float64 `json:"ele"`
	Time string  `json:"time"`
}

type Geometry struct {
	Type        string    `json:"type"`
	Coordinates []float64 `json:"coordinates"`
}

type Feature struct {
	Type       string     `json:"type"`
	Geometry   Geometry   `json:"geometry"`
	Properties Properties `json:"properties"`
}

type FeatureCollection struct {
	Type     string    `json:"type"`
	Features []Feature `json:"features"`
}

type Trkpt struct {
	XMLName xml.Name `xml:"trkpt"`
	Lat     string   `xml:"lat,attr"`
	Lon     string   `xml:"lon,attr"`
	Ele     string   `xml:"ele"`
	Time    string   `xml:"time"`
}

type Trkseg struct {
	XMLName xml.Name `xml:"trkseg"`
	Trkpts  []Trkpt  `xml:"trkpt"`
}

type Trk struct {
	XMLName xml.Name `xml:"trk"`
	Name    string   `xml:"name"`
	Type    string   `xml:"type"`
	Trksegs []Trkseg `xml:"trkseg"`
}

type Gpx struct {
	XMLName xml.Name `xml:"gpx"`
	Trks    []Trk    `xml:"trk"`
}

func convertGPXToJSON(gpxData []byte) ([]byte, error) {
	var gpx Gpx
	xml.Unmarshal(gpxData, &gpx)

	var features []Feature
	for _, trk := range gpx.Trks {
		for _, trkseg := range trk.Trksegs {
			for _, trkpt := range trkseg.Trkpts {
				lon, err := strconv.ParseFloat(trkpt.Lon, 64)
				if err != nil {
					fmt.Println("Error converting lon to float64:", err)
					continue
				}
				lat, err := strconv.ParseFloat(trkpt.Lat, 64)
				if err != nil {
					fmt.Println("Error converting lat to float64:", err)
					continue
				}
				ele, err := strconv.ParseFloat(trkpt.Ele, 64)
				if err != nil {
					fmt.Println("Error converting ele to float64:", err)
					continue
				}

				time := trkpt.Time

				geometry := Geometry{
					Type: "Point",
					Coordinates: []float64{
						lon,
						lat,
					},
				}

				feature := Feature{
					Type:     "Feature",
					Geometry: geometry,
					Properties: Properties{
						Ele:  ele,
						Time: time,
					},
				}

				features = append(features, feature)
			}
		}
	}

	fc := FeatureCollection{
		Type:     "FeatureCollection",
		Features: features,
	}

	jsonData, err := json.Marshal(fc)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	return jsonData, nil
}

func convertGpxFilesToJson(gpxFiles []fs.DirEntry, inputDir string, outputDir string) {
	for i, file := range gpxFiles {
		percent := int(i * 100 / len(gpxFiles))
		msg := fmt.Sprintf("%v/%v [%v%%] | %v", i, len(gpxFiles), percent, file.Name())
		fmt.Println(msg)

		gpxFile, err := os.Open(filepath.Join(inputDir, file.Name()))
		if err != nil {
			fmt.Println("Error opening GPX file:", err)
			continue
		}
		defer gpxFile.Close()

		gpxData, err := io.ReadAll(gpxFile)
		if err != nil {
			fmt.Println("Error reading GPX file:", err)
			continue
		}

		jsonData, err := convertGPXToJSON(gpxData)
		if err != nil {
			fmt.Println("Error converting GPX to JSON:", err)
			continue
		}

		outputFileName := strings.TrimSuffix(file.Name(), ".gpx") + ".json"
		outputFile, err := os.Create(filepath.Join(outputDir, outputFileName))
		if err != nil {
			fmt.Println("Error creating output file:", err)
			continue
		}
		defer outputFile.Close()

		_, err = outputFile.Write(jsonData)
		if err != nil {
			fmt.Println("Error writing JSON data to output file:", err)
			continue
		}
	}
}

var convertCmd = &cobra.Command{
	Use:   "convert",
	Short: "Converts all activity data from Strava",
	Long:  `Converts all activity data from Strava data exports for use in strava-routes`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("convert called")

		inputDir, err := cmd.Flags().GetString("input")
		if err != nil {
			fmt.Println("Error reading input directory flag:", err)
			return
		}

		files, err := os.ReadDir(inputDir)
		if err != nil {
			fmt.Println("Error reading files in input directory:", err)
			return
		}

		var gpxFiles []fs.DirEntry
		for _, file := range files {
			if !file.IsDir() && filepath.Ext(file.Name()) == ".gpx" {
				gpxFiles = append(gpxFiles, file)
			}
		}

		outputDir, err := cmd.Flags().GetString("output")
		if err != nil {
			fmt.Println("Error reading output directory flag:", err)
			return
		}

		// create --output directory if it doesn't exist
		err = os.MkdirAll(outputDir, 0755)
		if err != nil {
			fmt.Println("Error creating output directory:", err)
			return
		}

		convertGpxFilesToJson(gpxFiles, inputDir, outputDir)

		fmt.Println("Conversion complete.")
	},
}

func init() {
	rootCmd.AddCommand(convertCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// convertCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	convertCmd.Flags().StringP("input", "i", "", "Directory from which to load Strava activity data")
	convertCmd.Flags().StringP("output", "o", "", "Directory to save converted activty data")
}
