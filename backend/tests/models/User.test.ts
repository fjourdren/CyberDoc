import Guid from 'guid';

const dbHandler = require('../db_handler.js');

import * as u from '../../src/models/User';

import { FileType, IFile, File } from '../../src/models/File';
import mockClass from '../../src/__mocks__/mockHelpers/class'

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
// TODO test phone number
describe('Testing User.ts file', () => {


    it('enum role', () => {
        let role = u.Role;
        expect(role.OWNER).toStrictEqual("owner");
        expect(role.COLLABORATOR).toStrictEqual("collaborator");
        let key_cpt = Object.keys(role).length;
        expect(key_cpt).toStrictEqual(2)
    });

    
    it('should create a User', async () => {
        
        const insertion = await u.User.create(mockClass.User);
        expect(insertion.role).toBe('collaborator');
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
        expect(insertion.phoneNumber).toBe("+33660571778");
        expect(insertion.secret).toBe("JL5QH7CTHVIFXWU6S4TREV7BTMXCMTYK");
        expect(insertion.twoFactorApp).toBe(false);
        expect(insertion.twoFactorSms).toBe(false);
        expect(insertion.twoFactorEmail).toBe(false);

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
        
        mockClass.User.password  = "abc";
        let E:any;
        try{
            await u.User.create(mockClass.User);
        } catch(e){
            E = e;            
        }

        expect(E.errors.password.properties.message).toStrictEqual("Validator failed for path `password` with value `abc`");
        expect(E.errors.password.properties.type).toStrictEqual("user defined");
        expect(E.errors.password.properties.path).toStrictEqual("password");

        mockClass.User.password  = "abcdefghijklm";
        try{
            await u.User.create(mockClass.User);
        } catch(e){
            E = e;            
        }

        expect(E.errors.password.properties.message).toStrictEqual("Validator failed for path `password` with value `abcdefghijklm`");
        expect(E.errors.password.properties.type).toStrictEqual("user defined");
        expect(E.errors.password.properties.path).toStrictEqual("password");

        mockClass.User.password  = "abcdefghijklm@!?";
        try{
            await u.User.create(mockClass.User);
        } catch(e){
            E = e;            
        }

        expect(E.errors.password.properties.message).toStrictEqual("Validator failed for path `password` with value `abcdefghijklm@!?`");
        expect(E.errors.password.properties.type).toStrictEqual("user defined");
        expect(E.errors.password.properties.path).toStrictEqual("password");

        mockClass.User.password  = "abcdefghijklm@!?AA";
        try{
            await u.User.create(mockClass.User);
        } catch(e){
            E = e;            
        }

        expect(E.errors.password.properties.message).toStrictEqual("Validator failed for path `password` with value `abcdefghijklm@!?AA`");
        expect(E.errors.password.properties.type).toStrictEqual("user defined");
        expect(E.errors.password.properties.path).toStrictEqual("password");

    });

    


});

