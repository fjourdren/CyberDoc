import { NextFunction, Request, Response } from 'express';

import HttpCodes from '../helpers/HttpCodes'
import { requireNonNull } from '../helpers/DataValidation';

import IUser, { User } from '../models/User';
import IDevice from '../models/Device';

import DeviceService from '../services/DeviceService';

class UserDeviceController {

    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, browser, OS } = req.body;

            // check non null
            requireNonNull(name);

            // get user
            const user: IUser = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec());
            requireNonNull(user, HttpCodes.NOT_FOUND, "User not found");

            // add device
            requireNonNull(await DeviceService.create(user, name, browser, OS));

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
            requireNonNull(user, HttpCodes.NOT_FOUND, "User not found");

            // get device list
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

    public static async edit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const name: string = req.params.name;

            const newName: string  = req.body.name;
            const newBrowser: string  = req.body.browser;
            const newOS: string  = req.body.OS;

            // check non null
            requireNonNull(name);
            requireNonNull(newName);
            requireNonNull(newBrowser);
            requireNonNull(newOS);

            // get user
            const user: IUser = requireNonNull(await User.findById(res.locals.APP_JWT_TOKEN.user._id).exec());
            requireNonNull(user, HttpCodes.NOT_FOUND, "User not found");

            // found device and edit
            const deviceToEdit = requireNonNull(user.devices.find(device => device.name === name));
            await DeviceService.edit(user, deviceToEdit, newName, newBrowser, newOS);

            // reply client
            res.status(HttpCodes.OK);
            res.json({
                success: true,
                msg: "Device modified",
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
            requireNonNull(user, HttpCodes.NOT_FOUND, "User not found");

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