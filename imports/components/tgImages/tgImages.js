
export class Images
{
    constructor($const)
    {
        'ngInject';
        this.$const = $const;
    }

    getDiagramImage(diagram)
    {
        return this.getUrl(diagram.image);
    }

    getLibraryImage(library)
    {
        let image = undefined;

        for (let [id, instance] of Object.entries(library.tangibles)) {
            if(instance.icon)
            {
                image = library.images[id];
                break;
            }
        }
        return this.getUrl(image);
    }

    getTangibleImage(tangibleId, library)
    {
        let image = library.images[tangibleId];
        return this.getUrl(image);
    }

    getUrl(image)
    {
        if(image != undefined && image != 'data:image/png;base64,undefined' && image.startsWith('data:image/png;base64,'))
        {
            return image;
        }
        return this.$const.DEFAULT_IMAGE_URL;
    }
}
