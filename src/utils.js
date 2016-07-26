/**
 * The built-in default for extracting a user-friendly error message from any
 * thrown error in the `method`
 *
 * @param {(string|Error|{message: string})} err
 * @returns {string}
 */
export function defaultErrorParser(err) {
	/**
	 * A basic sanity check to see if we have anything to work with. If not, we
	 * just have to return a really unhelpful error message.
	 */
	if (!err) {
		return 'An unknown error occurred';
	}

	/**
	 * If the `err` is already a friendly string (or at least just parsable as
	 * one), then we'll just use that.
	 */
	if (typeof err === 'string') {
		return err;
	}

	/**
	 * If the `err` is a real `Error`, it should have a `message` we can use.
	 * We can also handle objects with a `message` property in them, if that's
	 * what happens to be thrown to this method.
	 */
	if (err.message) {
		return err.message;
	}

	/**
	 * We have to return *some* string, so if our common cases have failed,
	 * let's defer to the JS engine's string representation of whatever was
	 * thrown to this method.
	 */
	return err.toString();
}