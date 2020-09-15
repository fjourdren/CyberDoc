import { Router, Request, Response } from 'express';

import HttpCodes from '../../configs/HttpCodes'

const UserRouter = Router();

UserRouter.get('/profile', (req: Request, res: Response) => {
    res.status(HttpCodes.SUCCESS);
    res.json({
        success: true,
        msg: "",
        user: "test"
    });
});

export default UserRouter;