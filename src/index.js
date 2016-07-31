import * as STATES from './states';
const noop = function() {};
import defaultErrorParser from './utils';

/**
 * @param {!function} method - The method that should be overseen (it must return a `Promise` when invoked)
 */
export default function(method) {
	'use strict';

	const EVENTS = {
		BEGIN_EXECUTING: 'BEGIN_EXECUTING',
		COMPLETED_SUCCESSFULLY: 'COMPLETED_SUCCESSFULLY',
		COMPLETED_UNSUCCESSFULLY: 'COMPLETED_UNSUCCESSFULLY',
		MESSAGE_CHANGED: 'MESSAGE_CHANGED',
		STATE_CHANGED: 'STATE_CHANGED',
		RESULT_CHANGED: 'RESULT_CHANGED'
	};
	let message = '';
	let state = STATES.READY;
	let result = undefined;
	let subscriptionListener = noop;
	let errorParser = defaultErrorParser;

	/**
	 * @param {...*} args - The arguments with which to invoke `method` and kick off the executing
	 */
	function run(...args) {
		resetToExecuting();

		publishToSubscriber(EVENTS.BEGIN_EXECUTING, [...args]);

		return method(...args).then(
			response => {
				state = STATES.SUCCESS;
				message = 'Success';
				result = response;

				publishToSubscriber(EVENTS.COMPLETED_SUCCESSFULLY, response);

				/**
				 * Continue the chainable `then` of the raw `method`'s promise.
				 */
				return response;
			},
			err => {
				state = STATES.ERROR;
				message = errorParser(err);
				result = err;

				publishToSubscriber(EVENTS.COMPLETED_UNSUCCESSFULLY, err);

				/**
				 * Continue the chainable `then`/`catch` of the raw `method`'s promise.
				 */
				throw err;
			}
		);
	}

	function resetToReady() {
		state = STATES.READY;
		message = '';
		result = undefined;

		return overseer;
	}

	function resetToExecuting() {
		state = STATES.EXECUTING;
		message = '';
		result = undefined;

		return overseer;
	}

	/**
	 * @param {function} subscriber - The method to invoke as a callback when one of the `EVENTS` occurs.
	 */
	function subscribe(subscriber) {
		subscriptionListener = subscriber;

		return overseer;
	}

	function unsubscribe() {
		subscriptionListener = noop;

		return overseer;
	}

	/**
	 * @param {!string} event - Which event just occured.
	 * @param {?*} meta - any extra info about `event`
	 */
	function publishToSubscriber(event, meta) {
		subscriptionListener(event, meta);
	}

	/**
	 * @param {!function} newErrorParser - The method which to calculate the `message` based on a given `err`. Must return a `string` for `message`.
	 */
	function setErrorParser(newErrorParser) {
		errorParser = newErrorParser;
		return overseer;
	}

	const overseer = {
		run,
		subscribe,
		unsubscribe,
		resetToReady,
		resetToExecuting,
		setErrorParser,

		get state() {
			return state;
		},
		set state(newVal) {
			state = newVal;
			publishToSubscriber(EVENTS.STATE_CHANGED, newVal);
		},
		
		get message() {
			return message;
		},
		set message(newVal) {
			message = newVal;
			publishToSubscriber(EVENTS.MESSAGE_CHANGED, newVal);
		},
		
		get result() {
			return result;
		},
		set result(newVal) {
			result = newVal;
			publishToSubscriber(EVENTS.RESULT_CHANGED, newVal);
		},
		

		events: EVENTS,

		/**
		 * @type {boolean}
		 */
		get isSuccessful() {
			return state === STATES.SUCCESS;
		},
		/**
		 * @type {boolean}
		 */
		get isNotSuccessful() {
			return state !== STATES.SUCCESS;
		},
		/**
		 * @type {boolean}
		 */
		get isReady() {
			return state === STATES.READY;
		},
		/**
		 * @type {boolean}
		 */
		get isNotReady() {
			return state !== STATES.READY;
		},
		/**
		 * @type {boolean}
		 */
		get isExecuting() {
			return state === STATES.EXECUTING;
		},
		/**
		 * @type {boolean}
		 */
		get isNotExecuting() {
			return state !== STATES.EXECUTING;
		},
		/**
		 * @type {boolean}
		 */
		get hasError() {
			return state === STATES.ERROR;
		},
		/**
		 * @type {boolean}
		 */
		get hasNoError() {
			return state !== STATES.ERROR;
		},
		/**
		 * @type {boolean}
		 */
		get hasMessage() {
			return !!message;
		},
		/**
		 * @type {boolean}
		 */
		get hasNoMessage() {
			return !message;
		}
	};

	return overseer;
}