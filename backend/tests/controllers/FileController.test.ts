import AuthService from "../../src/services/AuthService";
import mockClass from "../../src/__mocks__/mockHelpers/class";

import jwt from 'jsonwebtoken';
import * as U from "../../src/models/User";
import * as T from "../../src/models/Tag";
import * as F from "../../src/models/File";
import * as D from '../../src/helpers/DataValidation'
import * as helperFunction from '../../src/__mocks__/mockHelpers/function'
import Mailer from "../../src/helpers/Mailer";
import TagService from "../../src/services/TagService";
import FileController from "../../src/controllers/FileController";
import FileService from "../../src/services/FileService";

const dbHandler = require('../db_handler.js');

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await dbHandler.connect());

beforeEach(async () => {
    let mock_user_1 = mockClass.User;
    await helperFunction.signup_user_1();
});

/**
 * Clear all test data after every test.
 */
afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase());

// TODO add file management in the test

describe('Testing FileController', () => {

    describe('upload', () => {

        // TODO
        // it('should pass', async () => {
        //     let user_1 = D.requireNonNull(await U.User.findOne({email: mockClass.User.email}).exec());
    
    
        //     let mockNext = jest.fn((err) => {
        //         throw new Error(err);
        //     });

        //     let requireFileIsDirectory = jest.spyOn(FileService, "requireFileIsDirectory").mockImplementation( () => {
        //         throw new Error("fine"); 
        //     });
    
        //     let req: any = {};
        //     let res: any = {
        //         locals: {
        //             APP_JWT_TOKEN: {
        //                 user: user_1
        //             }
        //         }
        //     };

        //     try{
        //        await FileController.upload(req, res, mockNext);
        //     } catch(e) {
        //         console.log("zegfjrqbglqberogmo")
        //         console.log(e);
        //     }
        // });

        // TODO
        // it('should not pass : name undefined', async () => {
        //     let E: any;
        //     let mockNext = jest.fn((err) => {
        //         throw new Error(err);
        //     });

        //     let user_1 = D.requireNonNull(await U.User.findOne({email: mockClass.User.email}).exec());
            
        //     let req: any = {};
        //     let res: any = {
        //         locals: {
        //             APP_JWT_TOKEN: {
        //                 user: user_1
        //             }
        //         }
        //     };

        //     try{
        //         await FileController.upload(req, res, mockNext);
        //     } catch(e) {
        //         console.log(e)
        //         expect(e).toStrictEqual(new Error("TypeError: Cannot read property 'name' of undefined"));
        //     }           

        // });

        
        
    });

    // describe('edit', () => {
    

    // });

    // describe('delete', () => {

    // });

 

});