import {Mongo} from 'meteor/mongo';

export const Diagrams = new Mongo.Collection('diagrams');

if (Meteor.isServer) {
    Meteor.publish('diagram', function(id) {
        check(id, String);
        console.log('Find diagram with id:', id);
        return Diagrams.find({_id: id});
    });

    Meteor.publish('diagrams', function() {
        return Diagrams.find({}); //, {fields: {'tangibles': 0}}
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

