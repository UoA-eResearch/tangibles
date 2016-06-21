import {Mongo} from 'meteor/mongo';

export const Diagrams = new Mongo.Collection('diagrams');
Ground.Collection(Diagrams);

if (Meteor.isServer) {
    Meteor.publish('diagrams', function() {
        return Diagrams.find({});
    });

    Diagrams.allow({
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

