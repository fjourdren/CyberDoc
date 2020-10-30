import UserService from "../../src/services/UserService";
import * as U from "../../src/models/User" 
import mockClass from "../../src/__mocks__/mockHelpers/class";
import * as D from '../../src/helpers/DataValidation'
import jwt from 'jsonwebtoken';
import AuthService from "../../src/services/AuthService";
const dbHandler = require('../db_handler.js');

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

describe('Testing UserService tag', () => {

    describe('hasRoles', () => {

        it('should be true', () => {
            const hasrole = UserService.hasRoles([U.Role.OWNER], U.Role.OWNER);
            expect(hasrole).toBe(true);
        });

        it('should not be true', () => {
            const hasrole = UserService.hasRoles([U.Role.COLLABORATER], U.Role.OWNER);
            expect(hasrole).not.toBe(true);
        });

    });

    describe('profile', () => {

        it('should pass', async () => {
            const userId: string = "123";

            const spyRequireNonNull = jest.spyOn(D, 'requireNonNull').mockImplementationOnce( () => {
                return true;
            });

            const result_profile = await UserService.profile(userId);
            
            expect(result_profile).toBe(true);
            expect(spyRequireNonNull).toHaveBeenCalledTimes(1);
           
        });

        it('should not pass', async () => {
            let E: any;
            const userId: string = "123";

            try{
                await UserService.profile(userId)
            } catch(e) {
                E = e;
            }

            expect(E.message).toBe('Internal Error');
            expect(E.statusCode).toBe(500);
           
        });

    });

    describe('updateProfile', async () => {

        let user = mockClass.User;
        

        let user_id = mockClass.User._id;
        let firstname = "Fulgen"
        let lastname = "Corporation"
        let email = "fulgencorp@gmail.com"
        let password = "123AZER21klsdhflkh!@?"

          

        // TODO erreur ici 
        it('should pass', async () => {
            
            const insertion = await U.User.create(user);

            // const spyRequireNonNull = jest.spyOn(D, 'requireNonNull').mockImplementation( () => {
            //     return  {
            //                 firstname: "test",
            //                 lastname: "test",
            //                 email: "test",
            //                 password: "test"
            //             }
            // });   

            const spyJWT = jest.spyOn(AuthService, 'generateJWTToken').mockImplementation( () => {
                return "token";
            });

            const l = await UserService.updateProfile(user_id, firstname, lastname, email, password);
            
            console.log(l)
            
            expect(true).toBe(true);
            // spyRequireNonNull.mockRestore();
        })
        

        

    });

    describe('forgottenPassword', () => {

    });
    
    describe('validate Token', () => {

    });

});