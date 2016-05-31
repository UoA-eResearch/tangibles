import {Meteor} from 'meteor/meteor';
import {Libraries} from '../imports/api/collections/libraries';
import {Diagrams} from '../imports/api/collections/diagrams';
import {Images} from '../imports/api/collections/images';
import entries from 'object.entries';
import {fromByteArray} from '../node_modules/base64-js/lib/b64';

if (!Object.entries) {
    entries.shim();
}

function insertImage(path, id) {
    var file_name = path + 'images/' + id + '.png';
    var data = Assets.getBinary(file_name);
    var base64 = fromByteArray(data);
    Images.insert({_id: id, data: base64});
}

Meteor.startup(() => {
    console.log('starting!');

    var path = 'default_db/';
    var defaultImageId = '6mpfqKyrjTNynuRJB';

    if(Images.find({_id: defaultImageId}).count() == 0)
    {
        insertImage(path, defaultImageId);
    }

    if(Libraries.find({}).count() == 0)
    {
        console.log("No libraries found, creating default.");
        var libraries = JSON.parse(Assets.getText(path + "libraries.json"));

        for(var i=0; i < libraries.length; i++)
        {
            var lib = libraries[i];

            // Insert images for each tangible
            for (let [id, tangible] of Object.entries(lib.tangibles)) {
                console.log(id, tangible);
                insertImage(path, id);
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
            Diagrams.insert(diagrams[i]);
            insertImage(path, diagrams[i]._id);
        }
    }
});
