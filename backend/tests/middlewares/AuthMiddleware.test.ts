import  AuthMiddleware  from "../../src/middlewares/AuthMiddleware";

describe("Testing AuthMiddleware : isAuthenticate", () => {
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
                APP_JWT_TOKEN:{
                    
                }
            }
        };

        const next = jest.fn((err)=>{
            E = err;
        });

        AuthMiddleware.isAuthenticate(req, res, next);

        expect(E.message).toBe(`Action only accesible to auth users`);
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
        expect(next).toHaveBeenCalled();
    });

});

describe("Testing AuthMiddleware : isntAuthenticate", () => {

    it("should authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                APP_JWT_TOKEN:{
                    
                }
            }
        };

        const next = jest.fn((err) => {
            E = err;
        });

        AuthMiddleware.isntAuthenticate(req, res, next);
        console.log(E);

        expect(E).toEqual(undefined);
        expect(next).toHaveBeenCalled();
    });

    it("should authorize", () => {
        let E: any;
        const req: any = {};
        const res: any = {
            locals: {
                
            }
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
        expect(next).toHaveBeenCalled();
    });
});
