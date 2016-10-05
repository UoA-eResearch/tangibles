import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

export const Libraries = new Mongo.Collection('libraries');
Ground.Collection(Libraries);

export const isLibraryMine = function (libraryId) {
    return Libraries.find({_id: libraryId, owner: Meteor.userId()}).count() == 1;
};

Meteor.methods({
    'libraries.insert' () {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        Libraries.insert({_id: Random.id(), owner: Meteor.userId(), name: "Untitled", images: {}, tangibles: {}});
    },
    'libraries.remove' (libraryId) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        if (isLibraryMine(libraryId)) {
            Libraries.remove(libraryId);
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own library ' + libraryId);
        }
    },
    'libraries.updateName' (libraryId, name) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        if (isLibraryMine(libraryId)) {
            Libraries.update(libraryId, {
                $set: {name: name}
            });
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own library ' + libraryId);
        }
    },
    'libraries.addTangible' (libraryId, tangibleId, tangible) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        if (isLibraryMine(libraryId)) {
            Libraries.update(
                {_id: libraryId},
                {$set: {['tangibles.' + tangibleId]: tangible}}
            );
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own library ' + libraryId);
        }
    },
    'libraries.removeTangible' (libraryId, tangibleId) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        if (isLibraryMine(libraryId)) {
            Libraries.update(
                {_id: libraryId},
                {$unset: {['images.' + tangibleId]: "", ['tangibles.' + tangibleId]: ""}}
            );
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own library ' + id);
        }
    },
    'libraries.updateTangible' (libraryId, tangibleId, tangible) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        if (isLibraryMine(libraryId)) {
            Libraries.update(
                {_id: libraryId},
                {$set: {['tangibles.' + tangibleId]: tangible}}
            );
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own library ' + libraryId);
        }
    },
    'libraries.updateTangibleImage' (libraryId, tangibleId, image) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        if (isLibraryMine(libraryId)) {
            Libraries.update(
                {_id: libraryId},
                {$set: {['images.' + tangibleId]: image}}
            );
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own library ' + libraryId);
        }
    }

});

if (Meteor.isServer) {
    Meteor.publish('libraries', function () {
        if (this.userId)
            return Libraries.find({"owner": this.userId});
        else
            return Libraries.find({"owner": 'everyone'});
    });

    Libraries.allow({
        insert: function () {
            return false;
        },
        update: function () {
            return false;
        },
        remove: function () {
            return false;
        }
    });
}