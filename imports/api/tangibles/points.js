
export class Point {

    /**
     * Distance between two points
     *
     * @param other
     */
    static distance(point1, point2) {
        var ax = point1.x - point2.x;
        var ay = point1.y - point2.y;

        return Math.sqrt(ax * ax + ay * ay);
    };

    static angle(point1, point2) {
        var dx = point2.x - point1.x;
        var dy = point2.y - point1.y;
        var angle = Math.atan2(dy, dx); // range (-PI, PI]
        angle *= 180 / Math.PI;
        return angle;
    };

    static subtract(point1, point2) {
        return {x: point1.x - point2.x, y: point1.y - point2.y};
    };

    static add(point1, point2) {
        return {x: point1.x + point2.x, y: point1.y + point2.y};
    };
}


export class Points {
    /**
     * Returns centroid of a list of points
     * @param points
     * @returns {number}
     */

    static getCentroid(points) {
        var centre = {x: 0, y: 0};

        for (var i = 0; i < points.length; i++) {
            centre.x = centre.x + points[i].x;
            centre.y = centre.y + points[i].y;
        }

        centre.x = centre.x / points.length;
        centre.y = centre.y / points.length;

        return centre;
    }

    static sortClockwise(points) {
        var centre = Points.getCentroid(points);
        var max_i = Points.getAnchorIndex(centre, points); // Point with furthest distance
        var indices = [0, 1, 2]; // indices of triangle
        indices.splice(indices.indexOf(max_i), 1); // remove index of anchor

        // Two possible orders
        var sort_a = [points[max_i], points[indices[0]], points[indices[1]]];
        var sort_b = [points[max_i], points[indices[1]], points[indices[0]]];

        // If determinant > 0 then sort_a CCW
        if (Points.determinant(sort_a) > 0) {
            return sort_a;
        }

        // Else sort_b CCW
        return sort_b;
    }

    static determinant(points) {
        return points[0].x * points[1].y + points[1].x * points[2].y + points[2].x * points[0].y - points[1].y * points[2].x - points[2].y * points[0].x - points[0].y * points[1].x;
    }

    static getAnchorIndex(centre, points) {
        var max = 0;
        var max_i = -1;

        //Find point with greatest distance, we use this as a reference point for determining the angle of the tangible
        for (var i = 0; i < points.length; i++) {
            var dist = Point.distance(centre, points[i]);

            if (dist > max) {
                max = dist;
                max_i = i;
            }
        }

        return max_i;
    };

    /**
     *
     * @param points
     * @returns {number}
     */

    static getOrientation(points) {
        var centre = Points.getCentroid(points);
        var max_i = Points.getAnchorIndex(centre, points);

        return Point.angle(centre, points[max_i]);
    };
}