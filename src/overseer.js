import * as STATES from './states.js';
import { defaultErrorParser } from './utils.js';

/**
 * @param {function} method
 * @returns {overseer}
 */
export default function(method) {

	/**
	 * The user-friendly message to show when necessary
	 * @type {string}
	 */
	let message = '';

	/**
	 * The current state of the overseen method
	 * @type {string}
	 */
	let state = STATES.READY;

	/**
	 * Where the data gets stored if the method resolves successfully
	 * @type {*}
	 */
	let result = undefined;

	/**
	 * The method to run to extract an error message from `method` if it rejects
	 * @type {function}
	 */
	let errorParser = defaultErrorParser;

	/**
	 * The main interface for the module. Since JS functions are secretly
	 * objects, there are some properties added to this method below. The args
	 * passed here are what `method` will be invoked with to run.
	 *
	 * @param {...*} args
	 * @returns {Promise}
	 */
	function overseer(...args) {
		/**
		 *
		 */
		return method(...args).then(
			response => {
				state = 'success';
				result = response;
				return response;
			},
			err => {
				state = 'error';
				message = errorParser(err);
				throw err;
			}
		);
	}

	Object.defineProperties(overseer, {
		/**
		 * Status utility props
		 */
		isExecuting: {
			get: () => state === 'executing'
		},
		isNotExecuting: {
			get: () => state !== 'executing'
		},
		isReady: {
			get: () => state === 'ready'
		},
		isNotReady: {
			get: () => state !== 'ready'
		},
		isSuccessful: {
			get: () => state === 'success'
		},
		isNotSuccessful: {
			get: () => state !== 'success'
		},
		hasError: {
			get: () => state === 'error'
		},
		hasMessage: {
			get: () => !!message
		},
		hasResult: {
			get: () => result !== undefined
		},

		/**
		 * Proxies for internal props
		 */
		message: {
			get: () => message,
			set: newVal => (message = newVal), overseer
		},
		state: {
			get: () => state,
			set: newVal => (state = newVal), overseer
		},
		result: {
			get: () => result,
			set: newVal => (result = newVal), overseer
		},
		errorParser: {
			get: () => errorParser,
			set: newVal => (errorParser = newVal), overseer
		}
	});

	overseer.resetToReady = () => {
		result = undefined;
		message = '';
		state = STATES.READY
	};

	overseer.resetToExecuting = () => {
		result = undefined;
		message = '';
		state = STATES.EXECUTING
	};

	overseer.setErrorParser = newVal => {
		errorParser = newVal;
		return overseer;
	};

	/**
	 * A reference to original method being overseen
	 * @type {Function}
	 */
	overseer.method = method;

	return overseer;
}