import { requireNonNull, requireIsNull } from "../../src/helpers/DataValidation";

describe('Testing DataValidation functions', () => {

    describe('Testing function requireNonNull', () => {
    
        it("should return values", () => {
            let value_1 = {};
            let value_2 = { test:"test" };
            let value_3 = 1;
            let r;
     
            r = requireNonNull(value_1)
            expect(r).toEqual(value_1);
    
            r = requireNonNull(value_2)
            expect(r).toEqual(value_2);
        
            r = requireNonNull(value_3)
            expect(r).toEqual(value_3);
    
        });
    
        it("should throw internal Error", () => {
            let value_1 = null;
            let value_2 = undefined;
    
            try{
                requireNonNull(value_1);
            } catch(e) {
                expect(e.statusCode).toBe(500);
                expect(e.message).toBe("Internal Error");
            }
    
            try{
                requireNonNull(value_2);
            } catch(e) {
                expect(e.statusCode).toBe(500);
                expect(e.message).toBe("Internal Error");
            }
    
        });
    
    });

    describe("Testing function requireIsNull", () => {

        it("should return null", () => {
            let value_1 = null;
            let value_2 = undefined;
            let r;
     
            r = requireIsNull(value_1)
            expect(r).toEqual(value_1);
    
            r = requireIsNull(value_2)
            expect(r).toEqual(null);
        });

        it("should throw internal error", () => {
            let value_1 = {};
            let value_2 = { test:"test" };
            let value_3 = 1;
     
            try{
                requireIsNull(value_1)
            } catch(e) {
                expect(e.message).toBe("Internal Error");
            }

            try{
                requireIsNull(value_2)
            } catch(e) {
                expect(e.message).toBe("Internal Error");
            }

            try{
                requireIsNull(value_3)
            } catch(e) {
                expect(e.message).toBe("Internal Error");
            }
    
        });

    });

});

    
