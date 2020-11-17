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

describe('Testing TagService', () => {
    let mock_user_1 = mockClass.User;
    let name = "mock_tag";
    let hexColor = "#AAAAAA";

    describe('create', () => {
    
        it('should create a new tag for user 1', async () => {
            // get user 1
            let user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());
            // create tag 1
            let tag_1 = await TagService.create(user_1, name, hexColor);
            // expect creation is correct
            expect(tag_1.name).toBe("mock_tag");
            expect(tag_1.hexColor).toBe("#AAAAAA");
            // get user 1
            user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());
            // expect user get linked to tag 1
            expect(user_1.tags[0].name).toBe("mock_tag");
            expect(user_1.tags[0].hexColor).toBe("#AAAAAA");
        });

    });

    describe('edit', () => {
        let spyFileUpdateMany = jest.spyOn(F.File, "updateMany").mockImplementation(jest.fn());

        it('should edit a tag', async () => {
            // create user 1 tag and get user 1 
            let tag_1 = await TagService.create(mock_user_1, name, hexColor);
            let user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());
            // get tag 0 for user 1
            tag_1 = D.requireNonNull(user_1.tags.find(tag => tag.id === user_1.tags[0]._id));
            // edit tag 0
            await TagService.edit(user_1, tag_1, "new_tag_name", "#FFFFFF");
            // get user 1
            user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());
            // expect tag 0 has been edited
            expect(user_1.tags[0].name).toBe("new_tag_name");
            expect(user_1.tags[0].hexColor).toBe("#FFFFFF");
            expect(spyFileUpdateMany).toHaveBeenCalledTimes(1);
        });

    });

    describe('delete', () => {

        it('should delete the tag', async () => {
            // create user 1 tag and get user 1 
            let tag_1 = await TagService.create(mock_user_1, name, hexColor);
            let user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());   
            // verify tag has been created
            expect(user_1.tags[0].name).toBe("mock_tag");
            expect(user_1.tags[0].hexColor).toBe("#AAAAAA");
            // delete the tag
            await TagService.delete(user_1, user_1.tags[0]._id);
            // verify the tag has been deleted from the validation variable
            user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());   
            expect(user_1.tags.length).toBe(0);
        });

        // TODO trying to delete something that don't exist -> ticket 133
        // it('should pass', async () => {
        //     // create get user 1 
        //     let user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());   
        //     // trying to delete something that don't exist
                
        // });


    });

    // TODO with IFile
    // describe('addToFile', () => {
     
    // });
    
    // TODO with IFile
    // describe('removeFromFile', () => {

    // });

});