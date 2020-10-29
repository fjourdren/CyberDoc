import AuthService from "../../src/services/AuthService";
import mockClass from "../../src/__mocks__/mockHelpers/class";

import jwt from 'jsonwebtoken';

import * as D from '../../src/helpers/DataValidation'

import Mailer from "../../src/helpers/Mailer";

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

describe('Testing AuthService tag', () => {

    describe('generateJWTToken', () => {

        const spyJwtSign = jest.spyOn(jwt, 'sign').mockImplementationOnce((user = mockClass.User, token = "test") => {
            return { token: true };
        });

        it('pass', () => {
            
            const result: any = AuthService.generateJWTToken(mockClass.User);

            expect(spyJwtSign).toHaveBeenCalledTimes(1);
            expect(result.token).toBe(true)
       });
        
    });

    describe('signup', () => {

        let firstname = mockClass.User.firstname;
        let lastname = mockClass.User.lastname;
        let email = mockClass.User.email;
        let password = mockClass.User.password;
        let role = mockClass.User.role;

        it('should pass', async () => {

            const spyRequireNonNull = jest.spyOn(D, 'requireNonNull').mockImplementationOnce( () => {
                return true;
            });

            const l = await AuthService.signup(firstname, lastname, email, password, role);
            expect(spyRequireNonNull).toHaveBeenCalledTimes(2);
        });

        it('should not pass because firstname is undefined', async () => {

            const spyRequireNonNull = jest.spyOn(D, 'requireNonNull').mockImplementationOnce( () => {
                return true;
            });

            let firstname = '';
            try{
                let l = await AuthService.signup(firstname, lastname, email, password, role);
            } catch(e) {
                expect(e.errors.firstname.properties.message).toBe("Path `firstname` is required.");
            }
            expect(spyRequireNonNull).toHaveBeenCalledTimes(2);
        });

        it('should not pass because email is not unique in the database', async () => {

            try{
                await AuthService.signup(firstname, lastname, email, password, role);
                await AuthService.signup(firstname, lastname, email, password, role);
            } catch(e) {
                expect(e.message).toBe("Another account with this mail already exists");
                expect(e.statusCode).toBe(409);
            }
        });

    });

    describe('login', () => {
        // only for registration
        let firstname = mockClass.User.firstname;
        let lastname = mockClass.User.lastname;
        let email = mockClass.User.email;
        let password = mockClass.User.password;
        let role = mockClass.User.role;

        // only for login
        let email_login = mockClass.User.email;
        let password_login = mockClass.User.password;

        it('should login', async () => {

            const token = await AuthService.signup(firstname, lastname, email, password, role);

            const spygenerateJWTToken = jest.spyOn(AuthService, 'generateJWTToken').mockImplementationOnce((user = mockClass.User) => {
                return "valid-token";
            });

            let return_token = await AuthService.login(email_login, password_login);
            expect(return_token).toBe("valid-token");
            expect(spygenerateJWTToken).toHaveBeenCalled();
        });

        it('should not login : invalid email', async () => {
            let E: any;
            const token = await AuthService.signup(firstname, lastname, email, password, role);

            const spygenerateJWTToken = jest.spyOn(AuthService, 'generateJWTToken').mockImplementationOnce((user = mockClass.User) => {
                return "valid-token";
            });

            try{
                let return_token = await AuthService.login("not_the_valid_email", password_login);
            } catch(e) {
                E = e;
            }
         
            expect(E.message).toBe("Internal Error");
            expect(E.statusCode).toBe(500);
            expect(spygenerateJWTToken).toHaveBeenCalled();
        });

        it('should not login : invalid password', async () => {
            let E: any;
            
            // Add of the user in the mongodb to make login test afterward
            const token = await AuthService.signup(firstname, lastname, email, password, role);

            const spygenerateJWTToken = jest.spyOn(AuthService, 'generateJWTToken').mockImplementationOnce((user = mockClass.User) => {
                return "valid-token";
            });

            try{
                let return_token = await AuthService.login(email_login, "not_the_valid_password");
            } catch(e) {
                E = e;
            }
   
            expect(E.message).toBe("Invalid credentials");
            expect(E.statusCode).toBe(401);
            expect(spygenerateJWTToken).toHaveBeenCalled();
        });

    });

    describe('forgottenPassword', () => {
        let email = mockClass.User.email;
        
        it('should pass', async () => {
            const spyRequireNonNull = jest.spyOn(D, 'requireNonNull').mockImplementationOnce( () => {
                return true;
            });
    
            const spyJwtSign = jest.spyOn(jwt, 'sign').mockImplementationOnce((user = mockClass.User, token = "test") => {
                return { token: true };
            });

            const spyMailer = jest.spyOn(Mailer, 'sendTemplateEmail').mockImplementationOnce( async () => {
               jest.fn()
            });
            
            await AuthService.forgottenPassword("testmail");
            expect(spyRequireNonNull).toHaveBeenCalled();
            expect(spyJwtSign).toHaveBeenCalled();
            expect(spyMailer).toHaveBeenCalled();
        });

        it('should not pass : invalid mail', async () => {
            let E: any;

            try{
                await AuthService.forgottenPassword("testail");
            } catch(e) {
                E=e;
            }

            expect(E.statusCode).toEqual(500);
            expect(E.message).toEqual('Internal Error');
        });

    });
    
    describe('validate Token', () => {
        
        it('should pass', () => {
            const spyValidateToken = jest.spyOn(jwt, 'verify').mockImplementationOnce( () => {
               return "true";
            });

            const l = AuthService.validateToken("validate");
            expect(l).toStrictEqual("true");
        });

    });

});