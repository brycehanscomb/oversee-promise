const expect = require('chai').expect;

const oversee = require('../dist/index').default;

describe('The oversee-promise main API', function() {

    describe('The basics', function() {

        it('should be available via import', function() {
            expect(oversee).to.exist;
        });

        it('should be an object', function() {
            expect(oversee).to.be.a('function');
        });

    });
});