'use strict';

var fs = require('fs');
var userObj = require('./users.json');

/**
 * Checks the users JSON file for a user with isActive = false, changes that
 * attribute to true and calls the method to begin user connection.
 */
exports.getInactiveUser = function() {
    userObj = JSON.parse(fs.readFileSync('./users/users.json', 'utf8'));
    for (var i =0; i<userObj.users.length; i++){
        if (!userObj.users[i].isActive){
            setUserActive(i);
            return prepareToConnect(i);
        }
    }
    return ["", "", "", "", ""];
};

/**
 * Checks for at least one inactive user to connect with.
 */
exports.checkInactiveUser = function () {
    userObj = JSON.parse(fs.readFileSync('./users/users.json', 'utf8'));
    var counter = 0;
    for (var i = 0; i<userObj.users.length; i++){
        if (!userObj.users[i].isActive){
            counter++;
        }
    }
    return counter;
};

/**
 * External method to set the user as inactive in the JSON file.
 * @param id ID of the user to mark as inactive.
 */
exports.userInactive = function(id) {
    setUserInactive(id);
};

/**
 * Reads the JSON file, marks the passed user as active (isActive = true) and saves the file.
 * @param userId ID of the user to mark as active.
 */
function setUserActive(userId) {
    userObj.users[userId].isActive = true;
    writeUsersFile(userObj);
}

/**
 * Reads the JSON file, marks the passed user as inactive (isActive = false) and saves the file.
 * @param userId ID of the user to mark as inactive.
 */
function setUserInactive(userId) {
    userObj.users[userId].isActive = false;
    writeUsersFile(userObj);
}

/**
 * Returns the username and password of the user with the ID passed for a connection attempt,
 * and the values false and 0 (to be used by the node server).
 * @param userId ID of the user credentials used to connect.
 */
function prepareToConnect(userId) {
    return [userObj.users[userId].id, userObj.users[userId].username, userObj.users[userId].password, false, 0];
}

/**
 * Writes the current userObj object as the users JSON file.
 * @param userJSON The JavaScript object to being saved as a JSON file.
 */
function writeUsersFile(userJSON){
    fs.writeFileSync("./users/users.json", JSON.stringify(userJSON, null, 2));
}
