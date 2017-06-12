var fs = require('fs');
var activeUserId;
var userAndPass;

// con export function esta función puede ser usada por script.js ?¿?¿?
/*export function getUserCredentials() {
    console.log(userAndPass);
    return userAndPass;
}*/

// y con exports.getInact... esta función puede ser usada por nodeserver.js
exports.getInactiveUser = function() {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    //console.log(usersList.users[1].username); //Esto me daría CORRECTAMENTE el username del segundo elemento del JSON
    for (var i =0; i<usersList.users.length; i++){
        if (!usersList.users[i].isActive){
            setUserActive(i);
            prepareToConnect(i);
            return;
        }
    }
    userAndPass = [null, null];
};

setUserActive = function (userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    usersList.users[userId].isActive = true;
    fs.writeFileSync("./users/users.json", JSON.stringify(usersList, null, 2));
};

setUserInactive = function (userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    usersList.users[userId].isActive = false;
    fs.writeFileSync("./users/users.json", JSON.stringify(usersList, null, 2));
};

prepareToConnect = function (userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    userAndPass = [usersList.users[userId].username, usersList.users[userId].password];
};
