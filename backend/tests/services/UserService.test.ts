import UserService from "../../src/services/UserService";
import * as U from "../../src/models/User" 
import mockClass from "../../src/__mocks__/mockHelpers/class";
import * as helperFunction from '../../src/__mocks__/mockHelpers/function'
import * as D from '../../src/helpers/DataValidation'
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

describe('testing UserService', () => {

    describe('hasRoles', () => {

        it('should be true', () => {
            const hasrole = UserService.hasRoles([U.Role.OWNER], U.Role.OWNER);
            expect(hasrole).toBe(true);
        });

        it('should not be true', () => {
            const hasrole = UserService.hasRoles([U.Role.COLLABORATOR], U.Role.OWNER);
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

    describe('updateProfile : should up', () => {

        it('should update', async () => {

            // parameters of updateProfile 
            let user_id = mockClass.User._id;
            let firstname = "Fulgen"
            let lastname = "Corporation"
            let email = "fulgencorp@gmail.com"
            let password = "123AZER21klsdhflkh!@?"
            let phoneNumber = "+33660571778";
            let secret = "JL5QH7CTNEWSECRETVIFXWU6S4TREV7B";
            let twoFactorApp = true;
            let twoFactorSms = true;
            let twoFactorEmail = true;  

            // create user 1
            let mock_user_1 = mockClass.User;
            await helperFunction.signup_user_1();
            let user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());
            
            // update user 1
            await UserService.updateProfile(undefined, undefined, user_id, undefined, firstname, lastname, email, password, phoneNumber, secret, twoFactorApp, twoFactorSms);

            // get user 1 after update
            const updated_user_1 = D.requireNonNull(await U.User.findOne({_id: user_1.id}).exec());

            expect(updated_user_1.role).toBe('collaborator');
            expect(updated_user_1.updated_at).not.toStrictEqual(user_1.updated_at);
            expect(updated_user_1.created_at).toStrictEqual(user_1.created_at);
            expect(updated_user_1._id).toBe(mockClass.User._id);
            expect(updated_user_1.firstname).toBe('Fulgen');
            expect(updated_user_1.lastname).toBe('Corporation');
            expect(updated_user_1.email).toBe('fulgencorp@gmail.com');
            expect(updated_user_1.password).not.toBe(user_1.password);
            expect(updated_user_1.phoneNumber).toBe(phoneNumber);
            expect(updated_user_1.secret).toBe(secret);
            expect(updated_user_1.twoFactorApp).toBe(twoFactorApp);
            expect(updated_user_1.twoFactorSms).toBe(twoFactorSms);
            expect(updated_user_1.__v).toBe(0);

        });
        
        it('should not update : email already exist', async () => {
            let E: any;

            // create user 1
            let mock_user_1 = mockClass.User;
            await helperFunction.signup_user_1();
            let user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());

            // create user 2
            let mock_user_2 = mockClass.User_2;
            await helperFunction.signup_user_2();
            let user_2 = D.requireNonNull(await U.User.findOne({email: mock_user_2.email}).exec());

            // try to update user 2 with user 1 email
            try{
                D.requireNonNull(await UserService.updateProfile(undefined, undefined, user_2._id, undefined, undefined, mock_user_1.email, undefined, undefined, undefined, undefined, undefined, undefined));
            } catch (e) {
                E = e;
            }

            expect(E.errors.email.properties.message).toBe('Error, expected `email` to be unique. Value: `test.fromFulgen@gmail.com`');

        });

    });

    describe('delete', () => {
        
        it('should delete the user', async () => {
            let E: any;
            // create user 1
            let mock_user_1 = mockClass.User;
            await helperFunction.signup_user_1();
            let user_1 = D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());

            // delete user 1
            await UserService.delete(user_1, "");

            // try to get user 1 
            try{
                    D.requireNonNull(await U.User.findOne({email: mock_user_1.email}).exec());
            } catch(e) {
               E = e;
            }

            expect(E.statusCode).toBe(500);
            expect(E.message).toBe('Internal Error');
         
        });

        it('should not find a user to delete', async () => {
            let E: any;
            try{
                await UserService.delete(mockClass.User, "")
            } catch(e) {
                E = e;
            }
           
        });

    });

});