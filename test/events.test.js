const expect = require('chai').expect;

const EVENTS = require('../dist/events');

describe('The events enumeration', function() {

    describe('The basics', function() {

        it('should be available via import', function() {
            expect(EVENTS).to.exist;
        });

        it('should be an object', function() {
            expect(EVENTS).to.be.an('object');
        });

        it('should have strings as values', function() {
            Object.keys(EVENTS).forEach(key => {
                expect(EVENTS[key]).to.be.a('string');
            })
        });

    });

    describe('The nitty-gritty', function() {

        it('should have 6 key/value pairs', function() {
            expect(Object.keys(EVENTS).length).to.equal(6);
        });

        it('keys should be uppercase', function() {
            expect(
                Object.keys(EVENTS).filter(key => {
                    return key !== key.toUpperCase();
                }).length
            ).to.equal(0);
        });

        it('values should be lowercase', function() {
            expect(
                Object.keys(EVENTS).map(key => EVENTS[key]).filter(value => {
                    return value !== value.toLowerCase();
                }).length
            ).to.equal(0);
        });

        it('should have no whitespace in the values', function() {
            expect(
                Object.keys(EVENTS).map(key => EVENTS[key]).filter(value => {
                    return value !== value.replace(/ +?/g, '');
                }).length
            ).to.equal(0);
        });

    });

    describe('The actual values', function() {

        const expectedKeysAndValues = [
            ['BEGIN_EXECUTING', 'begin_executing'],
            ['COMPLETED_SUCCESSFULLY', 'completed_successfully'],
            ['COMPLETED_UNSUCCESSFULLY', 'completed_unsuccessfully'],
            ['MESSAGE_CHANGED', 'message_changed'],
            ['STATE_CHANGED', 'state_changed'],
            ['RESULT_CHANGED', 'result_changed']
        ];

        expectedKeysAndValues.forEach(keyValPair => {
            const key = keyValPair[0];
            const value = keyValPair[1];
            it(`should have a "${key}" property equalling "${value}"`, function() {
                expect(EVENTS[key]).to.equal(value);
            });
        });

    });
});