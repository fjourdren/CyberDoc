import Guid from 'guid';

const dbHandler = require('../db_handler.js');

import * as f from '../../src/models/File';
import mockClass from "../../src/__mocks__/mockHelpers/class";

beforeAll(async () => await dbHandler.connect());

afterEach(async () => await dbHandler.clearDatabase());

afterAll(async () => await dbHandler.closeDatabase());

describe('testing File.ts file', () => {
    let file = new f.File();
    file._id = Guid.raw();
    file.type = f.FileType.DIRECTORY;
    file.mimetype = "application/x-dir"
    file.name = "My safebox";
    file.owner_id = mockClass.User._id;
    file.tags = [];

    it('should create a File', async () => {

        const insertion = await f.File.create(file);

        expect(insertion._id).toHaveLength(36);
        expect(insertion.name).toBe("My safebox");

        const getter = await f.File.find();

        expect(insertion._id).toBe(getter[0]._id);
    });

    it('should be good values', () => {
        expect(f.FileType.DIRECTORY).toBe(0);
        expect(f.FileType.DOCUMENT).toBe(1);
    })
    
});

