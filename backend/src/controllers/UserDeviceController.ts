import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import HTTPError from '../helpers/HTTPError';
import { requireNonNull } from '../helpers/DataValidation';

import IUser, { User } from '../models/User';
import IDevice from '../models/Device';

import DeviceService from '../services/DeviceService';

class UserDeviceController {

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name } = req.body;

            // check non null
            requireNonNull(name);

            // get user
            const user: IUser = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec());
            requireNonNull(user);

            // add device
            requireNonNull(await DeviceService.create(user, name));

            // reply client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Device created"
            });
        } catch(err) {
            next(err);
        }
    }

    public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // get user
            const user: IUser = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec());
            requireNonNull(user);

            const devices: IDevice[] = await DeviceService.get(user);

            // reply client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                devices: devices
            });
        } catch(err) {
            next(err);
        }
    }

    public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const name: string = req.params.name;

            // check non null
            requireNonNull(name);

            // get user
            const user: IUser = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec());
            requireNonNull(user);

            // delete device
            requireNonNull(await DeviceService.delete(user, name));

            // reply client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Device deleted",
            });
        } catch(err) {
            next(err);
        }
    }
}

export default UserDeviceController;