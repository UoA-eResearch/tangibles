import {Mongo} from 'meteor/mongo';

export const Libraries = new Mongo.Collection('libraries');

if (Meteor.isServer) {
    Meteor.publish('libraries', function() {
        return Libraries.find();
    });
}