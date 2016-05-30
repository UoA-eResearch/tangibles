
var imageStore = new FS.Store.FileSystem("images", {
    maxTries: 1
});

export const Images = new FS.Collection("images", {
    stores: [imageStore]
});

if (Meteor.isServer) {
    Meteor.publish('images', function() {
        return Images.find();
    });

    Images.allow({
        insert:   function () { return true;},
        update:   function () { return true;},
        remove:   function () { return true;},
        download: function () { return true;}
    });
}