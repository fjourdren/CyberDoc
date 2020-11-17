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

beforeEach(async () => {});

/**
 * Clear all test data after every test.
 */
afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase());

// TODO add file management in the test

describe('Testing FileService', () => {
 

    // describe('create', () => {

    // });

    // describe('edit', () => {
    

    // });

    // describe('delete', () => {

    // });

 

});