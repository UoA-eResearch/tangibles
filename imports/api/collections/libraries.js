import {Mongo} from 'meteor/mongo';

export const Libraries = new Mongo.Collection('libraries');
Ground.Collection(Libraries);

if (Meteor.isServer) {
    Meteor.publish('libraries', function() {
        return Libraries.find();
    });

    Libraries.allow({
        insert: function(){
            return true;
        },
        update: function(){
            return true;
        },
        remove: function(){
            return true;
        }
    });
}