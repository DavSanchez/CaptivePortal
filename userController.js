'use strict';

var fs = require('fs');
var activeUserId;
var userAndPass;

// con export function esta función puede ser usada por script.js ?¿?¿?
/*export function getUserCredentials() {
 console.log(userAndPass);
 return userAndPass;
 }*/

// y con exports.getInact... esta función puede ser usada por nodeserver.js

/*
* Esta función busca en el archivo JSON un usuario con el atributo isActive = false,
* tras lo cual cambia dicho atributo a true y llama al procedimiento para conectar a ese usuario
* a CoovaChilli... Si no hay usuarios activos pone el atributo userAndPass a null.
*/
exports.getInactiveUser = function() {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    //console.log(usersList.users[1].username); //Esto me daría CORRECTAMENTE el username del segundo elemento del JSON
    for (var i =0; i<usersList.users.length; i++){
        if (!usersList.users[i].isActive){
            setUserActive(i);
            prepareToConnect(i);
            console.log(userAndPass);
            return;
        }
    }
    console.log("Parece que no hay usuarios activos...");
    userAndPass = [null, null];
};

/*
* Lee el JSON de usuarios, marca el usuario como activo y lo guarda en el archivo.
* */
function setUserActive(userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    usersList.users[userId].isActive = true;
    fs.writeFileSync("./users/users.json", JSON.stringify(usersList, null, 2));
};
/*
* Lee el JSON de usuarios, marca el usuario como inactivo y lo guarda en el archivo.
* (aún sin uso, para la desconexión de usuarios... tiene que verlo el script.js!!!) TODO ¿cómo...?
* */
function setUserInactive(userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    usersList.users[userId].isActive = false;
    fs.writeFileSync("./users/users.json", JSON.stringify(usersList, null, 2));
};
/*
* Lee el JSON de usuarios y extrae el nombre de usuario y contraseña del usuario con la ID seleccionada
* */
function prepareToConnect(userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    userAndPass = [usersList.users[userId].username, usersList.users[userId].password];
};
