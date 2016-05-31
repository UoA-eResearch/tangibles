import {Visual} from '../../api/tangibles/visual';


export class Library
{
    constructor()
    {

    }

    static getLibraryIcon(library)
    {
        var iconId = undefined;

        for (let [id, instance] of Object.entries(library.tangibles)) {
            if(instance.icon)
            {
                iconId = id;
                break;
            }
        }

        if(iconId == undefined)
        {
            iconId = '6mpfqKyrjTNynuRJB'; //default image id
        }

        return Visual.getImageUrl(iconId);
    }
}
