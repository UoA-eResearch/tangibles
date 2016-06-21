import lodash from 'lodash';


export class DialogCtrl {
    constructor($scope, $mdDialog, $const) {
        this.$scope = $scope;
        this.$mdDialog = $mdDialog;
        $scope.$const = $const;

    }

    static open($mdDialog, component, event, size) {
        // Set dialog size, this is needed because the dialog components get inserted within md-dialog, not replacing it.
        // So you cannot set the class for the dialog in the html template for each individual dialog.
        $("#" + DialogCtrl.sizeStyleId).remove();

        if(size == 'small')
        {
            $('html > head').append(DialogCtrl.smallDialog);
        }
        else
        {
            $('html > head').append(DialogCtrl.largeDialog);
        }

        var nameKebabCase = lodash.kebabCase(component);
        $mdDialog.show({
            template: '<' + nameKebabCase + '></' + nameKebabCase + '>',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true
        }).then(function(){

        }, function() {

        });
    }

    close($event) {
        this.$mdDialog.hide('');
    }
}

DialogCtrl.sizeStyleId = 'tgDialogSize';
DialogCtrl.smallDialog = '<style id="' + DialogCtrl.sizeStyleId + '"> md-dialog {width: 300px; height: 300px;}</style>';
DialogCtrl.largeDialog = '<style id="' + DialogCtrl.sizeStyleId + '"> md-dialog {max-width: 90% !important; max-height: 90% !important; min-width: 60% !important;min-height: 50% !important;}</style>';
