

function TangibleRecognizer() {
    this.id = id;
    this.name = name;
    this.size = size;
    this.image = image;
    this.touchPoints = touchPoints;

    this.getCentre = function () { return getCentre(this); };
    this.getAngles = function () { return getAngles(this); };
    this.getDistanceMap = function () { return getDistanceMap(this); };
    this.getPointWithMaxAngle = function () { return getPointWithMaxAngle(this); };
    this.update = function () { update(this); };
}