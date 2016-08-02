const expect = require('chai').expect;

const utils = require('../dist/utils');

describe('The utility functions', function() {
    describe('method defaultErrorParser', function() {

        it('should be available, as a function', function() {
            expect(utils.defaultErrorParser).to.exist;
            expect(utils.defaultErrorParser).to.be.a('function');
        });

        it('should return a generic error when called with no arguments', function() {
            expect(utils.defaultErrorParser()).to.equal(
                'An unknown error occurred'
            );
        });

        it('should return any string passed into it as-is', function() {
            const input = `SOME_STRING ${Math.random()} ~~~~~`;
            expect(
                utils.defaultErrorParser(input)
            ).to.equal(input);
        });

        it('should return the value of the input\'s "message" property, if available', function() {
            const testString = `SOME_STRING ${Math.random()} ~~~~~`;

            /**
             * Basic object with property
             */
            let input = {
                message: testString
            };

            expect(utils.defaultErrorParser(input)).to.equal(testString);

            /**
             * Error type with constructor string set to `message`
             */
            input = new Error(testString);

            expect(utils.defaultErrorParser(input)).to.equal(testString);

            /**
             * Complex objects with no natural `message` property
             */
            input = new Date();
            input.message = testString;

            expect(utils.defaultErrorParser(input)).to.equal(testString);

            input = [];
            input.message = testString;

            expect(utils.defaultErrorParser(input)).to.equal(testString);
        });

        it('should return a stringified representation of the input if no "message" property available', function() {
            const inputs = [
                {},
                new Object(),
                { hello: 'world' },
                [],
                [1,2,3,4,5],
                ["Hello, world!"],
                new Date(),
                Math,
                Infinity,
                123456789,
                function() { return 'hello, world!'; },
                this
            ];

            inputs.forEach(input => {
                expect(
                    utils.defaultErrorParser(input)
                ).to.equal(
                    input.toString()
                );
            });
        });
    });
});