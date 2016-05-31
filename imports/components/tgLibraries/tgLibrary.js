import {Visual} from '../../api/tangibles/visual';
import {Images} from '../../api/collections/images';


export class Library
{
    constructor()
    {

    }

    static getIconBase64(library)
    {
        var iconId = Library.getLibraryIconId(library);
        var image = Images.findOne({_id: iconId});
        return Visual.getImageUrl(image.data);
    }

    static getLibraryIconId(library)
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

        return iconId;
    }
}
