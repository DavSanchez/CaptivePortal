// The included script ChilliLibrary.js creates a global chilliController object

// Defining functions and flags.
chilliController.onError  = handleErrors;
chilliController.onUpdate = updateUI ;
chilliController.ssl = true;

/**
 * Attempts to connect a user through the Chilli controller.
 * @param username User name retrieved from the node server.
 * @param password Password retrieved from the node server.
 */
function connect(username, password){
    chilliController.logon(username, password);
}

/**
 * Sends user credentials to the node server, which marks the user as inactive,
 *  and disconnects the user through the Chilli controller.
 * @param userCreds user credentials passed to the node server.
 */
function disconnect(userCreds){
    console.log('Disconnecting...');
    liberateUser(userCreds);
    chilliController.logoff();
}

/**
 * Callback function when the controller state changes.
 * @param cmd Interface method called.
 */
function updateUI(cmd) {
    console.log('Method called: ' + cmd +
        '\n Current State: ' + chilliController.clientState);
}

/**
 * Callback function to handle errors.
 * @param code Error code.
 */
function handleErrors (code) {
    console.log( 'Last contact with the Controller failed. Error code: ' + code );
}

/**
 * Gets current state of the Chilli controller.
 */
chilliController.refresh();
