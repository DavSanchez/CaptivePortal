'use strict';

var fs = require('fs');

/*
 * Esta función busca en el archivo JSON un usuario con el atributo isActive = false,
 * tras lo cual cambia dicho atributo a true y llama al procedimiento para conectar a ese usuario
 * a CoovaChilli... Si no hay usuarios activos pone el atributo userAndPass a null.
 * */
exports.getInactiveUser = function() {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    //console.log(usersList.users[1].username); //Esto me daría CORRECTAMENTE el username del segundo elemento del JSON
    for (var i =0; i<usersList.users.length; i++){
        if (!usersList.users[i].isActive){
            setUserActive(i);
            return prepareToConnect(i);
        }
    }
    console.log("Parece que no hay usuarios activos...");
};

/*
 * Lee el JSON de usuarios, marca el usuario como activo y lo guarda en el archivo.
 * */
function setUserActive(userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    usersList.users[userId].isActive = true;
    fs.writeFileSync("./users/users.json", JSON.stringify(usersList, null, 2));
}
/*
 * Lee el JSON de usuarios, marca el usuario como inactivo y lo guarda en el archivo.
 * (aún sin uso, para la futura desconexión de usuarios...)
 * */
function setUserInactive(userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    usersList.users[userId].isActive = false;
    fs.writeFileSync("./users/users.json", JSON.stringify(usersList, null, 2));
}
/*
 * Lee el JSON de usuarios y extrae el nombre de usuario y contraseña del usuario con la ID seleccionada
 * para escribirlos en el JSON de usuario activo, para que lo use el script front-end...
 * */
function prepareToConnect(userId) {
    var jsonContents = fs.readFileSync("./users/users.json");
    var usersList = JSON.parse(jsonContents);
    return [usersList.users[userId].username, usersList.users[userId].password];
}
