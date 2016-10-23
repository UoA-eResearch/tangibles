import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './tgHome.html';
import toolbar from '../tgToolbar/tgToolbar';

class HomeCtrl {
    constructor($scope, $reactive, $state, $const) {
        'ngInject';
        $reactive(this).attach($scope);

        //Opens diagrams with different libraries depending on whether the user is logged in or not.
        this.tracker = Tracker.autorun(function() {
            if (Meteor.user())
                $state.go('home.diagram', {diagramId: Random.id(), isNewDiagram: true, libraryId: Meteor.user().profile.defaultLibraryId});
            else
                $state.go('home.diagram', {diagramId: Random.id(), isNewDiagram: true, libraryId: $const.DEFAULT_LIBRARY_ID});
        });
    }

    zoomIn(){
        PubSub.publishSync('zoomIn', 0);
    }

    zoomOut()
    {
        PubSub.publishSync('zoomOut', 0);
    }

}

const name = 'tgHome';
export default angular.module(name, [angularMeteor, toolbar.name])
    .component(name, {
        template,
        controllerAs: name,
        controller: HomeCtrl
    })