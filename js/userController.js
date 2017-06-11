var fs = require('fs');
var activeUserId;
var userAndPass;

exports.getInactiveUser = function(){
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    //console.log(usersList.users[1].username); //Esto me daría CORRECTAMENTE el username del segundo elemento del JSON
    for (var i =0; i<usersList.users.length; i++){
        if (!usersList.users[i].isActive){
            activeUserId = setUserActive(i);
            prepareToConnect(activeUserId);
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
    return userId;
};

setUserInactive = function (userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    usersList.users[userId].isActive = false;
    fs.writeFileSync("./users/users.json", JSON.stringify(usersList, null, 2));
};

preparetoConnect = function (userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    userAndPass = [usersList.users[userId].username, usersList.users[userId].password];
};

export function getUserCredentials() {
    console.log(userAndPass); // TODO las tres lineas anteriores deberían ir en otra función o módulo!!
    return userAndPass;
}
