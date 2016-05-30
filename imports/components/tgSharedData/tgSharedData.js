import angular from 'angular';
import angularMeteor from 'angular-meteor';


export class SharedData
{
    constructor()
    {
        'ngInject';
        this.diagram = {name: 'hello'};
        this.stateName = '';
    }

    getDiagram()
    {
        return this.diagram;
    }

    getStateName()
    {
        return this.stateName;
    }

    setStateName(stateName)
    {
        this.stateName = stateName;
    }
}

