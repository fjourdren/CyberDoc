import { Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'

class UserController {
    public static profile(req: Request, res: Response) {
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "",
            user: "test"
        });
    }

    public static settings(req: Request, res: Response) {
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "",
            user: "test"
        });
    }

    public static delete(req: Request, res: Response) {
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "",
            user: "test"
        });
    }
}

export default UserController;