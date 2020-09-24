import { Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'

class DocumentController {

    public static todo(req: Request, res: Response) {
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "",
            user: "test"
        });
    }

}

export default DocumentController;