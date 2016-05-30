import {Meteor} from 'meteor/meteor';
import {Libraries} from '../imports/api/collections/libraries';
import {Diagrams} from '../imports/api/collections/diagrams';
import {Images} from '../imports/api/collections/images';
import entries from 'object.entries';

if (!Object.entries) {
    entries.shim();
}

insertImage = function (path, id) {

    var file_name = path + 'images/' + id + '.png';
    var data = Assets.getBinary(file_name);

    var file = new FS.File();
    file._id = id;
    file.attachData(data, {type: 'image/png'}, function (err) {
        if (err) throw err;
        file.name('image.png');
        Images.insert(file);
    });
};

Meteor.startup(() => {
    console.log('starting!');

    var path = 'default_db/';

    if(Libraries.find({}).count() == 0)
    {
        console.log("No libraries found, creating default.");
        var libraries = JSON.parse(Assets.getText(path + "libraries.json"));

        //console.log('Images: ', Images.find().fetch());

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

        console.log('Images: ', Images.find().fetch());
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
