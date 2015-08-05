/**
 * Loads a tangible library into memory
 * @param name: the name of the tangible library. TODO: document how to create a tangible library
 */

function loadLibrary(url)
{
    var datum = loadJSON(url).tangibles;
    console.log(data);
    var tangibles = [];

    for(var i = 0; i < datum.length; i++) {
        var data = datum[i];
        tangibles[i] = new Tangible(data.id, data.name, data.size, data.image, data.touchPoints);
    }
}

var tangibles = loadLibrary('http://localhost:63342/capacitive-tangibles/app/libraries/oroo/tangibles.json');
