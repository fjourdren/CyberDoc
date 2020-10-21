import { Mongoose } from 'mongoose';

const dbHandler = require('../db_handler.js');

import * as t from '../../src/models/Tag';

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

describe('Testing Tag.ts file', () => {
    let tag = new t.Tag();
    tag.name = "colorTag";
    tag.hexColor = "#6060C0";

    it('should create a Tag', async () => {
        const insertion = await t.Tag.create(tag);
        expect(insertion._id).toHaveLength(36);
        expect(insertion.name).toBe("colorTag");
        expect(insertion.hexColor).toBe("#6060C0");

        const getter = await t.Tag.find();

        expect(insertion._id).toBe(getter[0]._id);
    });
    
    it('should fail', async () => {
        let E:any;

        tag.hexColor = "46532"
        try{
            await t.Tag.create(tag);
        } catch(e) {
            E = e;
        }
        expect(E.errors.hexColor.properties.message).toBe(`Color needs to be a hexadecimal value`);

        tag.hexColor = "FA532d"
        try{
            await t.Tag.create(tag);
        } catch(e) {
            E = e;
        }
        expect(E.errors.hexColor.properties.message).toBe(`Color needs to be a hexadecimal value`);

        tag.hexColor = "#FA532dee"
        try{
            await t.Tag.create(tag);
        } catch(e) {
            E = e;
        }
        expect(E.errors.hexColor.properties.message).toBe(`Color needs to be a hexadecimal value`);

        tag.hexColor = "#FA532@"
        try{
            await t.Tag.create(tag);
        } catch(e) {
            E = e;
        }
        expect(E.errors.hexColor.properties.message).toBe(`Color needs to be a hexadecimal value`);


    });

 

});

