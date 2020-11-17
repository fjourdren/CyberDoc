import  AuthMiddleware  from "../../src/middlewares/AuthMiddleware";

describe("testing AuthMiddleware : isAuthenticate", () => {
    it("should authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                APP_JWT_TOKEN:{
                    user: "testing"
                }
            }
        };

        const next = jest.fn((err)=>{
            E = err;
        });

        AuthMiddleware.isAuthenticate(req, res, next);

        expect(E).toEqual(undefined);
        expect(next).toHaveBeenCalled();
    });

    it("should authorize even if res.APP_JWT_TOKEN is not a string", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                APP_JWT_TOKEN:{
                    user: 111
                }
            }
        };

        const next = jest.fn((err)=>{
            E = err;
        });

        AuthMiddleware.isAuthenticate(req, res, next);

        expect(E).toEqual(undefined);
        expect(next).toHaveBeenCalled();
    });

    it("should throw the HTTPerror", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                APP_JWT_TOKEN:{}
            }
        };

        const next = jest.fn((err)=>{
            E = err;
        });

        AuthMiddleware.isAuthenticate(req, res, next);

        expect(E.message).toBe(`Action only accesible to auth users`);
        expect(E.statusCode).toBe(401);   
        expect(next).toHaveBeenCalled();
    });

    it("should throw the HTTPerror", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                
            }
        };

        const next = jest.fn((err)=>{
            E = err;
        });

        AuthMiddleware.isAuthenticate(req, res, next);

        expect(E.message).toBe(`Action only accesible to auth users`);
        expect(E.statusCode).toBe(401);   
        expect(next).toHaveBeenCalled();
    });

});

describe("testing AuthMiddleware : isntAuthenticate", () => {

    it("should authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                APP_JWT_TOKEN:{}
            }
        };

        const next = jest.fn((err) => {
            E = err;
        });

        AuthMiddleware.isntAuthenticate(req, res, next);

        expect(E).toEqual(undefined);
        expect(next).toHaveBeenCalled();
    });

    it("should authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {}
        };

        const next = jest.fn((err) => {
            E = err;
        });
        
        AuthMiddleware.isntAuthenticate(req, res, next);

        expect(E).toEqual(undefined);
        expect(next).toHaveBeenCalled();
    });

    it("should not authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                APP_JWT_TOKEN:{
                    user: "testing"
                }
            }
        };

        const next = jest.fn((err) => {
            E = err;
        });

        AuthMiddleware.isntAuthenticate(req, res, next);

        expect(E.message).toBe(`Action only accesible to unauth users`);
        expect(E.statusCode).toBe(401);   
        expect(next).toHaveBeenCalled();
    });
});

describe("testing AuthMiddleware : isAuthenticateOrEditToken", () => {
  
    it("should not authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                APP_JWT_TOKEN:{
                    user: "testing"
                }
            }
        };

        const next = jest.fn((err) => {
            E = err;
        });

        AuthMiddleware.isAuthenticateOrEditToken(req, res, next);

        expect(E).toEqual(undefined);            
        expect(next).toHaveBeenCalled();
    });
    
    it("should not authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                APP_JWT_TOKEN:{}
            }
        };

        const next = jest.fn((err) => {
            E = err;
        });

        AuthMiddleware.isAuthenticateOrEditToken(req, res, next);

        expect(E.message).toBe(`Action only accesible to auth users`);    
        expect(E.statusCode).toBe(401);   
        expect(next).toHaveBeenCalled();
    });

    it("should not authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {}
        };

        const next = jest.fn((err) => {
            E = err;
        });

        AuthMiddleware.isAuthenticateOrEditToken(req, res, next);
        expect(E.message).toBe(`Action only accesible to auth users`);   
        expect(E.statusCode).toBe(401);   
        expect(next).toHaveBeenCalled();
    });

});