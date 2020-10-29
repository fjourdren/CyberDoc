import ErrorCatcherMiddleware from "../../src/middlewares/ErrorCatcherMiddleware";


describe('ErrorCatcherMiddleware', () => {

    describe('logErrorHandler', () => {

        // TODO
        it('should pass', async () => {
            let err = new Error('error test');
            let req: any = {};
            let res: any = {};
            let next = (e:any) => {return "true"};
            let E: any;
            try{
                await ErrorCatcherMiddleware.logErrorHandler(err, req, res, next);
            } catch(e) {
                console.log(e);
                console.log(e.error);
                console.log(e.message);
                E = e;
            }
            // expect(E).toBe("error test");
        });

    }); 

});