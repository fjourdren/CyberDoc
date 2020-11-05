import AuthService from "../../services/AuthService";
import mockClass from "./class";

import Guid from 'guid';


export async function signup_user_1(){
    const spyJWT = jest.spyOn(AuthService, 'generateJWTToken').mockImplementation( () => {
        return "token";
    });

    const spyGuidRaw = jest.spyOn(Guid, 'raw').mockImplementation( () => {
        return "01010101-0101-0101-0101-010101010101";
    });

    let user = mockClass.User;

    return await AuthService.signup(user.firstname, user.lastname, user.email, user.password, user.role)
}

export async function signup_user_2(){
    const spyJWT = jest.spyOn(AuthService, 'generateJWTToken').mockImplementation( () => {
        return "token";
    });

    const spyGuidRaw = jest.spyOn(Guid, 'raw').mockImplementation( () => {
        return "02020202-0202-0202-0202-020202020202";
    });

    let user = mockClass.User_2;

    return await AuthService.signup(user.firstname, user.lastname, user.email, user.password, user.role)
}

