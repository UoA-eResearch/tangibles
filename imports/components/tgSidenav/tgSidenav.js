
export class SidenavCtrl {

    static toggle(component_id, $mdSidenav, $mdUtil, onOpened=function () {

    }) {
        let sideNav = $mdSidenav;
        let debounce = $mdUtil.debounce(function () {
            sideNav(component_id)
                .toggle()
                .then(onOpened);
        }, 200);

        debounce();
    }
}
