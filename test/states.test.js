const expect = require('chai').expect;

const STATES = require('../dist/states');

describe('The states', function() {

	describe('The basics', function() {

		it('should be available via import', function() {
			expect(STATES).to.exist;
		});

		it('should be an object', function() {
			expect(STATES).to.be.an('object');
		});

		it('should have strings as values', function() {
			Object.keys(STATES).forEach(key => {
				expect(STATES[key]).to.be.a('string');
			})
		});

	});

	describe('The nitty-gritty', function() {

		it('should have 3 key/value pairs', function() {
			expect(Object.keys(STATES).length).to.equal(3);
		});

		it('keys should be uppercase', function() {
			expect(
				Object.keys(STATES).filter(key => {
					return key !== key.toUpperCase();
				}).length
			).to.equal(0);
		});

		it('values should be lowercase', function() {
			expect(
				Object.keys(STATES).map(key => STATES[key]).filter(value => {
					return value !== value.toLowerCase();
				}).length
			).to.equal(0);
		});

		it('should have no whitespace in the values', function() {
			expect(
				Object.keys(STATES).map(key => STATES[key]).filter(value => {
					return value !== value.replace(/ +?/g, '');
				}).length
			).to.equal(0);
		});

	});

	describe('The actual values', function() {

		const expectedKeysAndValues = [
			['ERROR', 'error'],
			['READY', 'ready'],
			['EXECUTING', 'executing']
		];

		expectedKeysAndValues.forEach(keyValPair => {
				const key = keyValPair[0];
				const value = keyValPair[1];
				it(`should have a "${key}" property equalling "${value}"`, function() {
					expect(STATES[key]).to.equal(value);
				});
			});

	});
});