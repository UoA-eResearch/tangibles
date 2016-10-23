import {Meteor} from 'meteor/meteor';
import {Libraries} from '../imports/api/collections/libraries';
import {Diagrams} from '../imports/api/collections/diagrams';
import entries from 'object.entries';
import {fromByteArray} from '../node_modules/base64-js';

if (!Object.entries) {
    entries.shim();
}

function getImage(path, id) {
    let file_name = path + 'images/' + id + '.png';
    let data = Assets.getBinary(file_name);
    return "data:image/png;base64," + fromByteArray(data);
}

Accounts.onCreateUser(function (options, user) {
    let libraries = Libraries.find({owner: "everyone"}).fetch();
    let diagrams = Diagrams.find({owner: "everyone"}).fetch();
    let defaultLibId = "";
    let oldIds = {};

    for (let i = 0; i < libraries.length; i++) {
        let lib = libraries[i];
        let newId = Random.id();
        oldIds[lib._id] = newId;
        lib._id = newId;
        lib.owner = user._id;

        if (lib.name == "Oroo")
            defaultLibId = lib._id;

        Libraries.insert(lib);
    }

    for (let i = 0; i < diagrams.length; i++) {
        let diagram = diagrams[i];
        diagram._id = Random.id();
        diagram.library._id = oldIds[diagram.library._id];
        diagram.owner = user._id;
        Diagrams.insert(diagram);
    }



    if (options.profile) {
        user.profile = options.profile;
        user.profile.defaultLibraryId = defaultLibId;
    }
    else {
        user.profile = {defaultLibraryId: defaultLibId};
    }

    console.log('user', user);

    return user;
});


// Meteor.AppCache.config({onlineOnly: ['/online/']});

Meteor.startup(() => {
    console.log('starting!');
    let path = 'default_db/';

    if (Libraries.find({}).count() == 0) {
        console.log("No libraries found, creating default.");
        let libraries = JSON.parse(Assets.getText(path + "libraries.json"));

        for (let i = 0; i < libraries.length; i++) {
            let lib = libraries[i];

            // Insert images for each tangible
            for (let [id, tangible] of Object.entries(lib.tangibles)) {
                lib.images[id] = getImage(path, id);
            }

            // Create the library
            Libraries.insert(lib);
        }
    }

    if (Diagrams.find({}).count() == 0) {
        console.log("No diagrams found, creating default.");
        let diagrams = JSON.parse(Assets.getText(path + "diagrams.json"));
        for (i = 0; i < diagrams.length; i++) {
            let diagram = diagrams[i];
            diagram.image = getImage(path, diagrams[i]._id);
            Diagrams.insert(diagram);
        }
    }
});
