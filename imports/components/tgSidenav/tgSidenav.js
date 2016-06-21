
export class SidenavCtrl {

    static toggle(component_id, $mdSidenav, $mdUtil, onOpened=function () {

    }) {
        var sideNav = $mdSidenav;
        var debounce = $mdUtil.debounce(function () {
            sideNav(component_id)
                .toggle()
                .then(onOpened);
        }, 200);

        debounce();
    }
}
