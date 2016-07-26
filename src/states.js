/******************************************************************************\
 * The various stages that the `method` could be in at any time
\******************************************************************************/

/**
 * When something has gone wrong, and the method is not currently executing
 */
export const ERROR = 'error';
/**
 * When the method is currently executing (even if it previously had errors)
 */
export const EXECUTING = 'executing';
/**
 * When the method has not been run yet (or has been reset)
 */
export const READY = 'ready';