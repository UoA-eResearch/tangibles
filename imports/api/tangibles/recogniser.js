import {Points, Point} from './points';

export class Recogniser {

    /**
     * An API similar to a skikit learn recogniser
     */

    constructor() {
    }

    /**
     * @param features: a list of features, each feature is a list of the three points that represent a tangible.
     * @param targets: an array integers which represent the class of tangible.
     */

    fit(features, targets) {
        this.features = features;
        this.targets = targets;
    }

    /**
     *
     * @param points: a feature to predict a tangible from, a set of three touch points.
     * @returns []
     */

    predict(points) {
        var matches = [];

        // We need to have minimum of three touch points to identify the Visual and it's orientation.
        if (points.length == 3) {
            var touchSorted = Points.sortClockwise(points);
            var touchDistA = Point.distance(touchSorted[0], touchSorted[1]);
            var touchDistB = Point.distance(touchSorted[0], touchSorted[2]);
            var touchDistC = Point.distance(touchSorted[1], touchSorted[2]);

            for (var i = 0; i < this.features.length; i++) {
                var feature = this.features[i];

                if (feature.length == 3) {
                    var regPointsDists = Points.sortClockwise(feature);
                    var regDistA = Point.distance(regPointsDists[0], regPointsDists[1]);
                    var regDistB = Point.distance(regPointsDists[0], regPointsDists[2]);
                    var regDistC = Point.distance(regPointsDists[1], regPointsDists[2]);
                    var similarity = Math.abs(touchDistA - regDistA) + Math.abs(touchDistB - regDistB) + Math.abs(touchDistC - regDistC);
                    matches.push({target: this.targets[i], similarity: similarity});
                }
            }

            matches.sort(function (a, b) {
                if (a.similarity < b.similarity)
                    return -1;
                if (a.similarity > b.similarity)
                    return 1;
                return 0;
            });

            return matches;
        }

        return []; //No tangible was recognised
    };
}