import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import template from './tgHome.html';
import toolbar from '../tgToolbar/tgToolbar'
import {Diagrams} from '../../api/collections/diagrams.js'
import {Libraries} from '../../api/collections/libraries.js'
import {Images} from '../../api/collections/images.js'

export class HomeCtrl {
    constructor($scope, $reactive, $timeout) {
        'ngInject';
        $reactive(this).attach($scope);
        //
        //this.diagramId = undefined;
        //this.prev_timeout = undefined;
        //this.save_timeout = 3000;
        //
        //this.helpers({
        //    diagram: ()=> {
        //        return Diagrams.findOne({});
        //    }
        //});
        //
        //this.helpers({
        //    library: ()=> {
        //        return Libraries.findOne({});
        //    }
        //});
        //
        //this.helpers({
        //    images: ()=> {
        //        return Images.find({});
        //    }
        //});
        //
        //this.subscribe('diagram', () => {
        //    return [this.getReactively('diagramId')]
        //});
        //
        //this.subscribe('library', () => {
        //    return [this.getReactively('diagram.library.id')]
        //});
        //
        //this.subscribe('images', () => {
        //    return [this.getReactively('diagramId')]
        //});
        //
        //$scope.$watch('$uiCtrl.state', function() {
        //    if($uiCtrl.state.name == 'tgHome.diagram')
        //    {
        //        this.diagramId = $uiCtrl.state.params.id;
        //    }
        //}.bind(this));
        //
        //$scope.$watch('$ctrl.diagram', function() {
        //    if(this.prev_timeout != undefined)
        //    {
        //        $timeout.cancel(this.prev_timeout);
        //    }
        //
        //    this.prev_timeout = $timeout(this.save.bind(this), this.save_timeout);
        //}.bind(this), true);
    }

    //save()
    //{
    //    console.log(this.diagram);
    //    //console.log(this.library);
    //
    //    for(var i = 0; i < this.library.tangibles.length; i++)
    //    {
    //        var tang = this.library.tangibles[i];
    //        var item = Images.findOne({'original.name': tang.icon});
    //        console.log(item.url());
    //    }
    //
    //    Diagrams.update({
    //        _id: this.diagram._id
    //    }, {
    //        $set: {
    //            name: this.diagram.name,
    //            tangibles: this.diagram.tangibles
    //        }
    //    });
    //}
}

const name = 'tgHome';
export default angular.module(name, [angularMeteor, ngMaterial, toolbar.name])
    .component(name, {
        template,
        controllerAs: name,
        controller: HomeCtrl
    })