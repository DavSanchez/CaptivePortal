'use strict';

var fs = require('fs');
var userObj = require('./users/users.json');

/*
 * Esta función busca en el archivo JSON un usuario con el atributo isActive = false,
 * tras lo cual cambia dicho atributo a true y llama al procedimiento para conectar a ese usuario
 * a CoovaChilli... Si no hay usuarios activos pone el atributo userAndPass a null.
 * */
exports.getInactiveUser = function() {
    //console.log(userObj.users[1].username); //Esto me daría CORRECTAMENTE el username del segundo elemento del JSON
    console.log('Buscando usuarios inactivos...')
    for (var i =0; i<userObj.users.length; i++){
        if (!userObj.users[i].isActive){
            setUserActive(i);
            return prepareToConnect(i);
        }
    }
    console.log("Parece que no hay usuarios libres...");
    return ["",""];
};

/*
 * Lee el JSON de usuarios, marca el usuario como activo y lo guarda en el archivo.
 * */
function setUserActive(userId) {
    console.log("Estableciendo usuario " + userId + " como ocupado.");
    userObj.users[userId].isActive = true;
    writeUsersFile(userObj);
}
/*
 * Lee el JSON de usuarios, marca el usuario como inactivo y lo guarda en el archivo.
 * (aún sin uso, para la futura desconexión de usuarios...)
 * */
function setUserInactive(userId) {
    console.log("Estableciendo usuario " + userId + " como libre.");
    userObj.users[userId].isActive = false;
    writeUsersFile(userObj);
}
/*
 * Lee el JSON de usuarios y extrae el nombre de usuario y contraseña del usuario con la ID seleccionada
 * para escribirlos en el JSON de usuario activo, para que lo use el script front-end...
 * */
function prepareToConnect(userId) {
    console.log("Almacenando credenciales del usuario " + userId + " para el cliente.");
    return [userObj.users[userId].username, userObj.users[userId].password];
}

function writeUsersFile(userJSON){
    console.log("Guardando estado de usuarios en fichero JSON.");
    fs.writeFileSync("./users/users.json", JSON.stringify(userJSON, null, 2));
}
