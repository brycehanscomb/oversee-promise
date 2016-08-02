# oversee-promise

Utility for working with JS promises in an MVC web app.

## Introduction

When building SPAs on the web, one of the most common challenges is firing off
AJAX events for external parties to deal with some data. Since these actions are
asynchronous, the JS community has adopted the use of `Promise`s to keep track
of the status and progress of these async requests.

Unfortunately, managing each of these promises and reacting to their state in
the app's views requires a certain amount of overhead that increases with each
new asynchronous event required. This utility aims to reduce that amount of
required boilerplate and provide handy utilities for making MVC apps simpler.

The wrapped promise can be analysed by the view to show the correct HTML based
on the following:

* The status of the request (unstarted, executing, successful or errorred-out)
* The final result of a successful request
* The error and/or error message of an unsuccessful request

## A Simple Example

Suppose you have an angular app that displays the latest news items in a list.
Using `oversee-promise`, you wrap your promise call using this utiliy's default
export:

### In Your `controller.js`

```js
/**
* Import `oversee` for use in your code.
*/
import oversee from '@brycehanscomb/oversee-promise';

/**
* `yourApi.getNewsItems()` is a function that returns a promise.
*/
const newsItemsQuery = oversee( yourApi.getNewsItems )

/**
 * Kickoff! Here we invoke the wrapped promise and fire off the AJAX request.
 */
newsItemsQuery.run();
```

### In Your `view.html`

Assuming an Angular application, you can use the properties on the wrapped
promise in various `ng-` directives:

```html
<p ng-if="newsItemsQuery.isExecuting">
    Loading your news items, please wait...
</p>

<div ng-if="newsItemsQuery.isSuccessful">
    <p ng-repeat="newsItem in newsItemsQuery.result">
        {{newsItem}}
    </p>
</div>

<p ng-if="newsItemsQuery.hasMessage && newsItemsQuery.hasError">
    There was an error: {{ newsItemsQuery.message }}
</p>
```

Of course, this pattern works just as well for other apps like React, Vue,
Aurelia, etc. Just keep in mind that some work might need to be done to hook up
into your library of choice. See the [Usage In Popular Frameworks](#usage-in-popular-frameworks)
for how to do this.

## API Reference

### Constructor Factory: `oversee(method)`

* Parameters:
  * `[function]` **`method`** (required)
  The function that returns a promise when invoked.
* Returns:
  * `[Object]` **`overseenPromise`**
  The wrapped promise with all the properties documented below.

The main method to wrap a promise. This does not affect the original `method` or
override any of its properties. Do not call with `new`, since this is a pure
factory function.

### Instance Properties

#### `state`

* Type: `string`

The current progress of the wrapped promise's execution. Will be one of:

* `'ready'` - The promise has not been invoked yet.
* `'executing'` - The promise has been invoked and is currently pending.
* `'success'` - The promise has successfully resolved.
* `'error'` - The promise was rejected.

Note that you should *probably* not mutate this value manually. If you want to
change or reset the instance, you should call [`instance.resetToReady()`](#api-resettoready)
or [`instance.resetToExecuting()`](#api-resettoexecuting).

If you manually mutate `instance.state`, this will trigger invocation of any
callback passed to [`instance.subscribe`](#api-subscribe).

This utility does not support cancelling an in-progress promise.

#### `message`

* Type: `string`

A human-readable account of what happened if the wrapped promise encountered an
error. By default, `message` will be set to either `error.message` (if
available) or simply by calling `error.toString()`. To override this behaviour,
see [`instance.setErrorParser`](#api-seterrorparser).

If you manually mutate `instance.message`, this will trigger invocation of any
callback passed to [`instance.subscribe`](#api-subscribe).

#### `result`

* Type: `undefined` or `any` or `Error`

If the wrapped promise was resolved successfully, `instance.result` will be set
to whatever data it was resolved with. If the wrapped promise was rejected with
an error, `instance.result` will be set to whatever error object it was rejected
with.

If the instance has not been invoked yet (with `instance.run()`) or it is
currently executing (but has not resolved/rejected yet) then `instance.result`
will be `undfined`.

If you manually mutate `instance.result`, this will trigger invocation of any
callback passed to [`instance.subscribe`](#api-subscribe).

#### isSuccessful

* Type: `boolean`

Whether the wrapped promise has resolved successfully.

#### isNotSuccessful

* Type: `boolean`

Whether the wrapped promise has not resolved successfully. This could be for
several reasons:

* The request has not started yet (`instance.run()` has not been invoked).
* The request is currently executing.
* The request encountered an error.

#### isReady

* Type: `boolean`

Whether the wrapped promise has not started yet (`instance.run()` has not been
invoked).

#### isNotReady

* Type: `boolean`

Whether the wrapped promise is in a state other than `ready`. This could be for
several reasons:

* The request is currently executing.
* The request has resolved successfully.
* The request encountered an error.

#### isExecuting

* Type: `boolean`

Whether the wrapped promise is currently in the process of running.

#### isNotExecuting

* Type: `boolean`

Whether the wrapped promise is not currently running. This could be for several
reasons:

* The request has not started yet (`instance.run()` has not been invoked).
* The request has resolved successfully.
* The request encountered an error.

#### hasError

* Type: `boolean`

Whether the wrapped promise has completed but has been rejected with an error.

#### hasNoError

* Type: `boolean`

Whether the wrapped promise is not currently completed with an error. This could
be for several reasons:

* The request has not started yet (`instance.run()` has not been invoked).
* The request has resolved successfully.
* The request is currently executing.

#### hasMessage

* Type: `boolean`

Whether the wrapped promise has anything assigned to its `instance.message`
property. This is usually the case if the request has encountered an error, but
it can also be assigned at any time.

#### hasNoMessage

* Type: `boolean`

Whether the wrapped promise does not have anything assigned to its
`instance.message` property. This will usually be the case when the request has
not encountered an error, ie: it is unstarted, currently executing or has been
resolved successfully. Be aware that `instance.result` can also be manually
assigned at any time.

#### hasResult

* Type: `boolean`

Whether the wrapped promise has anything assigned to its `instance.result`
property. This will usually be the case if the request has completed
successfully (in which case, `instance.result` will be the response payload) or
if the request was rejected with an error (in which case, `instance.result`)
will be the error that the request was rejected with. Be aware that
`instance.result` can also be manually assigned at any time.

#### hasNoResult

* Type: `boolean`

Whether the wrapped promise does not have anything assigned to its
`instance.result` property. This is usually the case if the request is unstarted
or currently executing, but it can also be assigned at any time.

### Instance Methods

#### `run()`

* Parameters:
  * `[any]` **`[arg1, [arg2, ...argN]]`** (optional)
  Any arguments that should be passed to the original `method` when invoked.
* Returns:
  * `[Promise]` **`invokedPromise`**
  A `then`-able promise that is the result of invoking the original `method`.

If the original `method` would take any arguments when invoking it normally,
pass them into `run`.

#### <a name="api-subscribe"></a>`subscribe(callback)`

* Parameters:
  * `[function]` **`[callback]`** (required)
  A method to invoke when the internal state of the instance has changed.
* Returns:
  * `[overseenPromise]` **`this`**
  The instance of the `overseenPromise` to which this method belongs.

Passing a function into this method will act as a listener for updates to the
instance's internal state. `callback` will be invoked with the following
arguments:

1. `[string]` **`event`**
  The type of internal happening that just occurred. Will be one of:
  * `'begin_executing'` - The wrapped promise begins executing (usually in
  reaction to `.run()` being invoked)
  * `'completed_successfully'` - The wrapped promise has finished executing and
  there was no error. Any data that the promise was resolved with is now
  available to be accessed at `instance.result`.
  * `'completed_unsuccessfully'` - The wrapped promise has finished executing but
  there was an error. More information about the error is now available to be
  accessed at `instance.result`, and human-readable error message is available
  to be accessed at `instance.message`.
  * `'message_changed'` - The user has manually set a new value of
  `instance.message`. This event will not be fired any other time (even if some
  other event causes the `message` property to be changed).
  * `'state_changed'` - The user has manually set a new value of
  `instance.state`. This event will not be fired any other time (even if some
  other event causes the `state` property to be changed).
  * `'result_changed'` - The user has manually set a new value of
  `instance.result`. This event will not be fired any other time (even if some
  other event causes the `result` property to be changed).
2. `[any]` **`meta`** (optional)
  Any relevant metadata that is associated with the `event`.

If `instance.subscribe` is invoked more than once, only the last invocation will
have its callback registered -- other previous calls will be overwritten.

To stop listening to events / state changes, call [`instance.unsubscribe`](#api-unsubscribe).

#### <a name="api-unsubscribe"></a>`unsubscribe()`

* Parameters: none
* Returns:
  * `[overseenPromise]` **`this`**
  The instance of the `overseenPromise` to which this method belongs.

Removes the subscription to `callback` passed to [`instance.subscribe`](#api-subscribe).
The `callback` will no longer be invoked for any internal state change.

#### <a name="api-resettoready"></a>`resetToReady()`

* Parameters: none
* Returns:
  * `[overseenPromise]` **`this`**
  The instance of the `overseenPromise` to which this method belongs.

Calling this method will reset the internal state of the `instance` to be as if
it had not been called for the first time yet. This will set the following
property values:

* `instance.state` will now be `'ready'`
* `instance.message` will now be `''`
* `instance.result` will now be `undefined`

This method does not affect any functions passed to [`subscribe`](#api-subscribe)
or [`setErrorHandler`](#api-seterrorhander).

#### <a name="api-resettoexecuting"></a>`resetToExecuting()`

* Parameters: none
* Returns:
  * `[overseenPromise]` **`this`**
  The instance of the `overseenPromise` to which this method belongs.

Calling this method will reset the internal state of the `instance` to be as if
it were currently executing the wrapped promise. This will set the following
property values:

* `instance.state` will now be `'executing'`
* `instance.message` will now be `''`
* `instance.result` will now be `undefined`

This method does not affect any functions passed to [`subscribe`](#api-subscribe)
or [`setErrorHandler`](#api-seterrorhander).

#### <a name="api-seterrorparser"></a>`setErrorParser(parserFunction)`

* Parameters:
  * `[function]` **`[parserFunction]`** (required)
  A method to invoke when an error has occurred to get an error message.
* Returns:
  * `[overseenPromise]` **`this`**
  The instance of the `overseenPromise` to which this method belongs.

For the instance to automatically assign a `message` when the wrapped promise
encounters an error, it needs to know how to parse the error that has occurred.
By default, `message` will be set to either `error.message` (if available) or
simply by calling `error.toString()`.

If your errors do not conform to this shape, you can tell the instance how to
extract a human-readable error message from your specific error shapes.

The `errorHandler` function will be invoked with the `error` thrown by the
rejected wrapped promise, and it must return a human-readable error message
string.

For example, if your errors look like this:

```json
{
  "data": null,
  "whatWentWrong": "API is down for maintenance."
}
```

Then you should pass in a function that extracts the `whatWentWrong` property:

```js
/**
 * A function that can extract the error message from your specific error objects
 */
function myErrorParser(error) {
  return error.whatWentWrong;
}

/**
 * Create the instance as usual
 */
const myInstance = oversee( api.getSomeInfo );

/**
 * Register the error parser
 */
myInstance.setErrorParser(myErrorParser);
```

## <a name="usage-in-popular-frameworks"></a>Usage In Popular Frameworks

Since `oversee-promise` maintains its own internal state, you need to tell your
library/framework when it should ingest the new state and (potentially)
re-render your view.

To do this, pass a callback function into the `subscribe` method of your wrapped
promise. See below for common examples:

### AngularJS (v1.x)

In your controller:

```js
/**
* Wrap the promise as usual.
*/
const newsItemsQuery = oversee( yourApi.getNewsItems );

/**
* Call `$scope.$apply()` when the internal state has updated.
*/
newsItemsQuery.subscribe($scope.$apply);
```

### React

```jsx
/**
 * A method that calls React's `render`
 */
function onRequestChanged() {
    ReactDOM.render(<MyApp />, targetNode);
}

/**
 * Wrap the promise as usual.
 */
const newsItemsQuery = oversee( yourApi.getNewsItems );

/**
 * Call your re-render method when the internal state has updated.
 */
newsItemsQuery.subscribe(onRequestChanged);
```

### Vue

No work should be necessary for Vue since it reacts to all watched property
changes. If you find a case where Vue isn't aware of a state change, please file
an issue so we can get it working!

### Other Frameworks

The steps required to alert your framework of choice that it needs to re-render
are probably similar to one of the examples above.

Whatever method you use to inform your framework that it's time to re-render,
you should pass that method into `subscribe` so it gets notified.