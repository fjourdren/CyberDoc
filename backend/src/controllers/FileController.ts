import { Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'

class FileController {
    // upload a new file controller
    public static upload(req: Request, res: Response) {
        // if user is owner
        // if user is owner of parent place
        // file type is autorized
        throw new Error('Method not implemented.');
    }


    // get content and informations of a file controller
    public static get(req: Request, res: Response) {
        // if user is owner of the file (or have an access)

        

       /** OUT example
            id": "9b81d950-b605-471f-a654-4fffba6bcfc5",
            "ownerName": "John Doe",
            "name": "File.pdf",
            "mimetype": "application/pdf",
            "size": 666,
            "lastModified"
         */

        // TODO
    }


    // update content of a file
    public static updateContent(req: Request, res: Response) {
        // if user is owner (or have rights to modify)

        // TODO
    }


    // edit atributes of a file controller
    public static edit(req: Request, res: Response) {
        // if user is owner
        // ne pas pouvoir déplacer un fichier dans lui même

        // TODO
    }


    // delete a file controller
    public static delete(req: Request, res: Response) {
        // if user is owner

        // TODO
    }


    // copy a file controller
    public static copy(req: Request, res: Response) {
        // if user is owner (or have right to copy)

        // TODO
    }


    // ask to generate a preview of a file controller
    public static preview(req: Request, res: Response) {
        // if user is owner or have access

        // TODO
    }


    // start downloading a file controller
    public static download(req: Request, res: Response) {
        // if user is owner or have access

        // TODO
    }
}

export default FileController;