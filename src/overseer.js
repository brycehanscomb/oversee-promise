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

	const noop = function() {};

	/**
	 * @param {(Error|{message: string}|*)} err - A throwable value, hopefully with a `message` property
	 */
	const defaultErrorParser = function(err) {
		if (err.message) {
			return err.message;
		} else {
			return err.toString();
		}
	}

	let message = '';
	let state = 'ready';
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
				state = 'success';
				message = 'Success';
				result = response;

				publishToSubscriber(EVENTS.COMPLETED_SUCCESSFULLY, response);

				/**
				 * Continue the chainable `then` of the raw `method`'s promise.
				 */
				return response;
			},
			err => {
				state = 'error';
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
		state = 'ready';
		message = '';
		result = undefined;

		return overseer;
	}

	function resetToExecuting() {
		state = 'executing';
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
			return state === 'success';
		},
		/**
		 * @type {boolean}
		 */
		get isNotSuccessful() {
			return state !== 'success';
		},
		/**
		 * @type {boolean}
		 */
		get isReady() {
			return state === 'ready';
		},
		/**
		 * @type {boolean}
		 */
		get isNotReady() {
			return state !== 'ready';
		},
		/**
		 * @type {boolean}
		 */
		get isExecuting() {
			return state === 'executing';
		},
		/**
		 * @type {boolean}
		 */
		get isNotExecuting() {
			return state !== 'executing';
		},
		/**
		 * @type {boolean}
		 */
		get hasError() {
			return state === 'error';
		},
		/**
		 * @type {boolean}
		 */
		get hasNoError() {
			return state !== 'error';
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