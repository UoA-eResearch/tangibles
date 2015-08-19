
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
        return Math.sqrt(this.x * other.x + this.y * other.y);
    };
}

function Size(width, height) {
    this.width = width;
    this.height = height;
}

function toPoints(rawArray)
{
    var items;

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