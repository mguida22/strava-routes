package util

import (
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/simplify"
)

func PointsToSimplifiedLineStringJSON(rawJSON []byte) ([]byte, error) {
	original, err := geojson.UnmarshalFeatureCollection(rawJSON)
	if err != nil {
		return nil, err
	}

	// extract the points from the feature collection
	var points []orb.Point
	for _, feature := range original.Features {
		if point, ok := feature.Geometry.(orb.Point); ok {
			points = append(points, point)
		}
	}

	lineString := orb.LineString(points)

	threshold := 0.0001
	simplified := simplify.DouglasPeucker(threshold).Simplify(lineString)

	fc := geojson.NewFeatureCollection()
	fc.Append(geojson.NewFeature(simplified))

	fcJSON, err := fc.MarshalJSON()
	if err != nil {
		return nil, err
	}

	return fcJSON, nil
}
