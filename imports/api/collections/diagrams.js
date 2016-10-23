import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

export const Diagrams = new Mongo.Collection('diagrams');
Ground.Collection(Diagrams);

export const isDiagramMine = function (diagramId) {
    return Diagrams.find({_id: diagramId, owner: Meteor.userId()}).count() == 1;
};

Meteor.methods({
    'diagrams.insert' (diagram) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        diagram.owner = Meteor.userId();
        Diagrams.insert(diagram);
    },
    'diagrams.update' (diagramId, name, scale, position, tangibles) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        if (isDiagramMine(diagramId)) {
            Diagrams.update({
                _id: diagramId
            }, {
                $set: {
                    name: name,
                    scale: scale,
                    position: position,
                    tangibles: tangibles
                }
            });
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own diagram ' + diagramId);
        }
    },
    'diagrams.saveThumb' (diagramId, image) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        if (isDiagramMine(diagramId)) {
            Diagrams.update({
                _id: diagramId
            }, {
                $set: {
                    image: 'data:image/png;base64,' + image
                }
            });
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own diagram ' + diagramId);
        }
    },
    'diagrams.remove' (diagramId) {
        if (!Meteor.userId())
            throw new Meteor.Error('not-authorized');

        if (isDiagramMine(diagramId)) {
            Diagrams.remove(diagramId)
        }
        else {
            throw new Meteor.Error('not-authorized: you do not own diagram ' + diagramId);
        }
    }
});

if (Meteor.isServer) {
    Meteor.publish('diagrams', function () {
        if (this.userId)
            return Diagrams.find({"owner": this.userId});
        else
            return Diagrams.find({"owner": 'everyone'});
    });

    Diagrams.allow({
        insert: function () {
            return false;
        },
        update: function () {
            return false;
        },
        //Update: Enable delete diagram function
        remove: function () {
            return true;
        }
    });
}

