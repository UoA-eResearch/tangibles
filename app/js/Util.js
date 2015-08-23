
function Point(x, y) {
    this.x = x;
    this.y = y;

    /**
     * Distance between two points
     *
     * @param other
     */
    this.distanceTo = function(other)
    {
        var ax = this.x - other.x;
        var ay = this.y - other.y;

        return Math.sqrt(ax * ax + ay * ay);
    };

    this.angleTo = function(other)
    {
        var dx = other.x - this.x;
        var dy = other.y - this.y;
        var angle = Math.atan2(dy, dx); // range (-PI, PI]
        angle *= 180 / Math.PI;
        return angle;
    }
}

function Size(width, height) {
    this.width = width;
    this.height = height;
}

function toPoints(rawArray)
{
    var items = [];

    for(var i = 0; i < rawArray.length; i++)
    {
        var item = rawArray[i];
        items[i] = new Point(item[0], item[1]);
    }

    return items;
}

// Load JSON text from server hosted file and return JSON parsed object
function loadJSON(filePath) {
    // Load json file;
    var json = loadTextFileAjaxSync(filePath, "application/json");
    // Parse json
    return JSON.parse(json);
}

// Load text with Ajax synchronously: takes path to file and optional MIME type
function loadTextFileAjaxSync(filePath, mimeType)
{
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET",filePath,false);
    if (mimeType != null) {
        if (xmlhttp.overrideMimeType) {
            xmlhttp.overrideMimeType(mimeType);
        }
    }
    xmlhttp.send();
    if (xmlhttp.status==200)
    {
        return xmlhttp.responseText;
    }
    else {
        // TODO Throw exception
        return null;
    }
}
