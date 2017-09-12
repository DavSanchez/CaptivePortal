//var csv = require("csv");
var fs = require("fs");
var prueba; // = require("./prueba.csv");
var prueba30min; // = require("./prueba30min.csv");

var usersObj = {
    users: [] //{
    //     id: 0,
    //     username: "prueba30min0",
    //     password: "prueba30min0",
    //     isActive: false
    // }
};

var users30minObj = {
    users: []
};

function doTheJob() {
    console.log("Probando...");
    prueba = fs.readFileSync("./Prueba.csv", "utf-8");
    prueba30min = fs.readFileSync("./PruebaOneTime.csv", "utf-8");

    crearObjeto(prueba,usersObj);
    crearObjeto(prueba30min,users30minObj);
}

function crearObjeto(variable, objeto) {
    var filas = variable.split("\r\n");
    for (var i = 0; i < filas.length; i++) {
        var elementos = filas[i].split(",");
        var item = {
            id: i + 1,
            username: elementos[0],
            password: elementos[1],
            isActive: false
        };
        objeto.users.push(item);
    }
    if (objeto.users[0].username === "Prueba0") {
        fs.writeFileSync("./users.json", JSON.stringify(objeto, null, 2));
    } else {
        fs.writeFileSync("./usersOneTime.json", JSON.stringify(objeto, null, 2));
    }

    console.log("Tarea terminada...");
}

doTheJob();


