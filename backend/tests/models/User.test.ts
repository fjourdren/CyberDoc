import Guid from 'guid';

const dbHandler = require('../db_handler.js');

import * as u from '../../src/models/User';

import { FileType, IFile, File } from '../../src/models/File';

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await dbHandler.connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase());

describe('Testing User.ts file', () => {
    let user: u.IUser = new u.User();
    user._id       = Guid.raw()
    user.firstname = "test";
    user.lastname  = "fromFulgen";
    user.email     = "test.fromFulgen@gmail.com";
    user.password  = "password123PASSWORD@!?";
    user.role      = u.Role.COLLABORATER;

    let root_user_dir: IFile = new File();
    root_user_dir._id = Guid.raw();
    root_user_dir.type = FileType.DIRECTORY;
    root_user_dir.mimetype = "application/x-dir"
    root_user_dir.name = "My safebox";
    root_user_dir.owner_id = user._id;
    root_user_dir.tags = [];

    user.directory_id = root_user_dir._id;

    it('enum role', () => {
        let role = u.Role;
        expect(role.OWNER).toStrictEqual("owner");
        expect(role.COLLABORATER).toStrictEqual("collaborater");
        let key_cpt = Object.keys(role).length;
        expect(key_cpt).toStrictEqual(2)
    });

    
    it('should create a User', async () => {
        
        const insertion = await u.User.create(user);
        expect(insertion.role).toBe('collaborater');
        expect(insertion.updated_at).toBeInstanceOf(Date);
        expect(insertion.created_at).toBeInstanceOf(Date);
        expect(insertion._id).toHaveLength(36);
        expect(insertion.tags);
        expect(insertion.firstname).toBe('test');
        expect(insertion.lastname).toBe('fromFulgen');
        expect(insertion.email).toBe('test.fromFulgen@gmail.com');
        expect(insertion.password).not.toBe('password123PASSWORD@!?');
        expect(insertion.directory_id);
        expect(insertion.__v);

        const getter = await u.User.find();

        expect(insertion.role).toBe(getter[0].role);

    });

    it('should delete a User', async () => {
        const result = await u.User.deleteOne({"mail" : "test.fromFulgen@gmail.com"});
        const expected = {
            n: 0,
            ok: 1,
            deletedCount: 0
        }

        expect(result).toStrictEqual(expected);
    });

    it('should return that password is illegal', async () => {
        
        user.password  = "abc";
        let E:any;
        try{
            await u.User.create(user);
        } catch(e){
            E = e;            
            // console.log(e.errors)
            // console.log(e.errors.password)
            // console.log(e.errors.password.properties)
        }

        expect(E.errors.password.properties.message).toStrictEqual("Password doesn't respect the required format");
        expect(E.errors.password.properties.type).toStrictEqual("user defined");
        expect(E.errors.password.properties.path).toStrictEqual("password");

        user.password  = "abcdefghijklm";
        try{
            await u.User.create(user);
        } catch(e){
            E = e;            
        }

        expect(E.errors.password.properties.message).toStrictEqual("Password doesn't respect the required format");
        expect(E.errors.password.properties.type).toStrictEqual("user defined");
        expect(E.errors.password.properties.path).toStrictEqual("password");

        user.password  = "abcdefghijklm@!?";
        try{
            await u.User.create(user);
        } catch(e){
            E = e;            
        }

        expect(E.errors.password.properties.message).toStrictEqual("Password doesn't respect the required format");
        expect(E.errors.password.properties.type).toStrictEqual("user defined");
        expect(E.errors.password.properties.path).toStrictEqual("password");

        user.password  = "abcdefghijklm@!?AA";
        try{
            await u.User.create(user);
        } catch(e){
            E = e;            
        }

        expect(E.errors.password.properties.message).toStrictEqual("Password doesn't respect the required format");
        expect(E.errors.password.properties.type).toStrictEqual("user defined");
        expect(E.errors.password.properties.path).toStrictEqual("password");

    });

    


});

