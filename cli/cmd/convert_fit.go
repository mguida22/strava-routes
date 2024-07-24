package cmd

import (
	"bytes"
	"fmt"
	"io/fs"
	"math"
	"os"
	"path/filepath"
	"strings"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
	"github.com/spf13/cobra"
	"github.com/tormoder/fit"
)

func convertFitToJSON(fitData []byte) ([]byte, error) {
	fit, err := fit.Decode(bytes.NewReader(fitData))
	if err != nil {
		return nil, err
	}

	activity, err := fit.Activity()
	if err != nil {
		return nil, err
	}

	fc := geojson.NewFeatureCollection()
	for _, record := range activity.Records {
		lng := record.PositionLong.Degrees()
		lat := record.PositionLat.Degrees()

		// check if lng/lat are NaN
		if math.IsNaN(lng) || math.IsNaN(lat) {
			continue
		}

		point := orb.Point{lng, lat}
		fc.Append(geojson.NewFeature(point))
	}

	fcJSON, err := fc.MarshalJSON()
	if err != nil {
		return nil, err
	}

	return fcJSON, nil
}

func convertFitFilesToJSON(fitFiles []fs.DirEntry, inputDir, outputDir string) {
	for i, file := range fitFiles {
		percent := int(i * 100 / len(fitFiles))
		msg := fmt.Sprintf("%v/%v [%v%%] | %v", i, len(fitFiles), percent, file.Name())
		fmt.Println(msg)

		// Convert fit file to JSON
		filePath := filepath.Join(inputDir, file.Name())
		fitData, err := os.ReadFile(filePath)
		if err != nil {
			fmt.Println("Error reading FIT file:", err)
			continue
		}

		jsonData, err := convertFitToJSON(fitData)
		if err != nil {
			fmt.Println("Error converting FIT to JSON:", err)
			continue
		}

		outputFileName := strings.TrimSuffix(file.Name(), ".fit") + ".json"
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

func runFitCmd(cmd *cobra.Command, args []string) {
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

	var fitFiles []fs.DirEntry
	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".fit" {
			fitFiles = append(fitFiles, file)
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

	convertFitFilesToJSON(fitFiles, inputDir, outputDir)

	fmt.Println("Conversion complete")
}

var convertFitCmd = &cobra.Command{
	Use:   "convert-fit-to-json",
	Short: "Converts all gpx activity data from Strava",
	Long: `Converts all gpx activity data from Strava data exports for use in
	strava-routes. You may need to unzip the fit files first, ex: "gunzip -dk *.gz"`,
	Run: runFitCmd,
}

func init() {
	rootCmd.AddCommand(convertFitCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// convertCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	convertFitCmd.Flags().StringP("input", "i", "", "Directory from which to load Strava activity data")
	convertFitCmd.Flags().StringP("output", "o", "", "Directory to save converted activity data")
}
