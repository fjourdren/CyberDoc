import { requireNonNull } from "../helpers/DataValidation";

import IUser, { User } from "../models/User";
import IDevice, { Device } from "../models/Device";
import HTTPError from "../helpers/HTTPError";
import HttpCodes from "../helpers/HttpCodes";

class DeviceService {
    // create a device
    public static async create(user: IUser, name: string, browser: string, OS: string): Promise<IDevice> {
        // check that both variable aren't null
        requireNonNull(name);

        // check that there is not already a device with this name
        const devices: IDevice[] = await DeviceService.get(user);
        for(let i = 0; i < devices.length; i++)
            if(devices[i].name == name)
                throw new HTTPError(HttpCodes.BAD_REQUEST, "This Device name is already used");

        // create Device object
        const newDevice: IDevice = new Device();
        newDevice.name = name;
        newDevice.browser = browser;
        newDevice.OS = OS;

        // add device to user
        user.devices.push(newDevice);

        // update the user
        requireNonNull(await User.update({ _id: user._id }, {$set: {devices: user.devices}}));
        return newDevice;
    }

    // get devices
    public static async get(user: IUser): Promise<IDevice[]> {
        return requireNonNull(await User.findById(user._id).exec()).devices;
    }

    // edit device
    public static async edit(user: IUser, device: IDevice, newName: string, newBrowser: string, newOS: string): Promise<void> {
        // generate updater string
        let updateString: Record<string, unknown> = {};

        // check that there is not already a device with this name
        const devices: IDevice[] = await DeviceService.get(user);
        for(let i = 0; i < devices.length; i++)
            if(devices[i].name == newName)
                throw new HTTPError(HttpCodes.BAD_REQUEST, "This Device name is already used");

        if(newName)
            updateString = Object.assign({}, { 'devices.$.name': newName });

        if(newBrowser)
            updateString = Object.assign(updateString, { 'devices.$.browser': newBrowser });
        
        if(newOS)
            updateString = Object.assign(updateString, { 'devices.$.OS': newOS });

        // update mongo data
        await User.updateMany({ _id: user._id, 'devices._id': device._id }, { '$set': updateString });
    }

    // delete a device
    public static async delete(user: IUser, deviceName: string): Promise<void> {
        // non null check
        requireNonNull(deviceName);

        // remove the device
        await User.updateOne( {'_id': user._id }, { $pull: { "devices": { "name": deviceName }} }, {'multi': true }).exec();
    }
}

export default DeviceService;