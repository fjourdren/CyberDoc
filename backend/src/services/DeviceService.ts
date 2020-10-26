import { requireNonNull } from "../helpers/DataValidation";

import IUser, { User } from "../models/User";
import IDevice, { Device } from "../models/Device";
import HTTPError from "../helpers/HTTPError";
import HttpCodes from "../helpers/HttpCodes";

class DeviceService {
    // create a device
    public static async create(user: IUser, name: string): Promise<IDevice> {
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
    public static async edit(user: IUser, device: IDevice, newName: string): Promise<void> {
        // generate updater string
        let updateString: Record<string, unknown> = {};
    
        if(newName)
            updateString = Object.assign({}, { 'devices.$.name': newName });

        // update mongo data
        await User.updateMany({ _id: user._id, 'devices._id': device._id }, { '$set': updateString });
    }

    // delete a device
    public static async delete(user: IUser, deviceName: string): Promise<IUser> {
        // non null check
        requireNonNull(deviceName);

        // remove the device
        return requireNonNull(await User.update({'_id': user._id }, { $pull: { "devices": { "name": deviceName }} }, {'multi': true}).exec());
    }
}

export default DeviceService;