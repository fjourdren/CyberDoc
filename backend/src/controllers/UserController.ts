import { Request, Response } from 'express';

import HttpCodes from '../configs/HttpCodes'

class UserController {
    public static profile(req: Request, res: Response) {
        res.status(HttpCodes.OK);
        res.json({
            success: true,
            msg: "",
            user: "test"
        });
    }
}

export default UserController;