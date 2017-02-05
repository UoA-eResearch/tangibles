import {Points, Point} from './points';

export class Recogniser {

    /**
     * An API similar to a scikit learn recogniser
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
     * The recognition algorithm computes the similarity between a triangle (three touch points) and an array of features,
     * each feature being three touch points that represent a particular tangible.
     *
     * To consistently compare triangles, the algorithm finds the centroid of each triangle, and then finds the point
     * with the furthest distance from the centre. It then sorts the points that make up each triangle clockwise
     * and computes the similarity of each triangle by seeing how closely the lengths of each side match.
     *
     * @param points: a feature to predict a tangible from, a set of three touch points.
     * @returns []: an array of targets and their similarity to the detected touch points.
     */

    predict(points,scale) {
        let matches = [];

        // We need to have minimum of three touch points to identify the Visual and it's orientation.
        if (points.length == 3) {
            let touchSorted = Points.sortClockwise(points); // Sort the detected points in clockwise order. The point
            // with the furthest distance from the centroid of the triangle is first. We do this so that when we
            // consistently compare the lengths of the triangle sides.

            // Find the length of each side of the detected triangle
            let touchDistA = Point.distance(touchSorted[0], touchSorted[1])*scale;
            let touchDistB = Point.distance(touchSorted[0], touchSorted[2])*scale;
            let touchDistC = Point.distance(touchSorted[1], touchSorted[2])*scale;
            this.touchDistancesABC = [touchDistA, touchDistB, touchDistC];
            
            for (let i = 0; i < this.features.length; i++) {
                let feature = this.features[i];

                if (feature.length == 3) {
                    let regPointsDists = Points.sortClockwise(feature); // Sort the features points in clockwise order.
                    // The point with the furthest distance from the centroid of the triangle is first. We do this so
                    // that when we consistently compare the lengths of the triangle sides.

                    // Find the length of each side of the feature triangle
                    let regDistA = Point.distance(regPointsDists[0], regPointsDists[1]);
                    let regDistB = Point.distance(regPointsDists[0], regPointsDists[2]);
                    let regDistC = Point.distance(regPointsDists[1], regPointsDists[2]);

                    // Compute the similarity metric: The sum of the differences between the sides of the touch point
                    // triangle and the feature triangle.
                    let similarity = Math.abs(touchDistA - regDistA) + Math.abs(touchDistB - regDistB) + Math.abs(touchDistC - regDistC);
                    matches.push({target: this.targets[i], similarity: similarity});
                }
            }

            // Sort the matches by their similarity. Highest similarity comes first.
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
