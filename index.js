var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
//const fetch = require('node-fetch');
var messages = [];

app.use(express.static("public"));


app.get("/hello", function (req, res) {
  res.status(200).send("Hello World!");
});


io.on("connection", function (socket) {
  console.log("Alguien se ha conectado con Sockets");

  // Manejar el evento de unirse a una sala
  socket.on("join-room", function (username) {
    socket.join(username);
    console.log(`${username} se ha unido a la sala ${username}`);
  });

  // Emitir los mensajes a la sala específica del usuario
  socket.on("new-message", function (data) {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Cookie", "cookiesession1=678A3E10E82C9FD71F9E281AAD4522E9");

      const raw = JSON.stringify({
        "sesion": data.sesion ?? "",
        "comercio": data.comercio ?? "",
        "monto": data.monto ?? 0,
        "usuario_id": data.usuario ?? 'SIN USUARIO',
        "accion": data.accion ?? 0
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      import('node-fetch').then((fetch) => {
        fetch("https://appsip.genesisempresarial.com/GEfectivoAdmin/api/LogBotonPago/InsertLogBotonPago", requestOptions)
          .then((response) => response.text())
          .then((result) => console.log(result))
          .catch((error) => console.error(error));

      }).catch(error => console.error('Error al importar node-fetch:', error));;
    } catch (e) {
      console.log(e);
    }


    //console.log(data);
    messages.push(data);
    const messagesReturn = messages.filter(m => m.sesion == data.sesion);
    const validos = messagesReturn.filter(m => m.accion == 1);

    console.log(validos.length);
    // console.log(messages);
    // console.log(messagesReturn);
    // Enviar mensajes solo a la sala del usuario que los envió
    io.to(data.sesion).emit("messages", validos.length != 0 ? messagesReturn : []);
  });


});



server.listen(8080, function () {
  console.log("Servidor corriendo en http://localhost:8080");
});


