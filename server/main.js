import {Meteor} from 'meteor/meteor';
import {Libraries} from '../imports/api/collections/libraries';
import {Diagrams} from '../imports/api/collections/diagrams';
import entries from 'object.entries';
import {fromByteArray} from '../node_modules/base64-js/lib/b64';

if (!Object.entries) {
    entries.shim();
}

function getImage(path, id) {
    var file_name = path + 'images/' + id + '.png';
    var data = Assets.getBinary(file_name);
    return "data:image/png;base64," + fromByteArray(data);
}


Meteor.AppCache.config({onlineOnly: ['/online/']});

Meteor.startup(() => {
    console.log('starting!');
    var path = 'default_db/';

    if(Libraries.find({}).count() == 0)
    {
        console.log("No libraries found, creating default.");
        var libraries = JSON.parse(Assets.getText(path + "libraries.json"));

        for(var i=0; i < libraries.length; i++)
        {
            var lib = libraries[i];

            // Insert images for each tangible
            for (let [id, tangible] of Object.entries(lib.tangibles)) {
                lib.images[id] = getImage(path, id);
            }

            // Create the library
            Libraries.insert(lib);
        }
    }

    if(Diagrams.find({}).count() == 0)
    {
        console.log("No diagrams found, creating default.");
        var diagrams = JSON.parse(Assets.getText(path + "diagrams.json"));
        for(i=0; i < diagrams.length; i++)
        {
            var diagram = diagrams[i];
            diagram.image = getImage(path, diagrams[i]._id);
            Diagrams.insert(diagram);
        }
    }
});
