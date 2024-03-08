
import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);
import fetch from 'node-fetch';

const messages = [];

app.use(express.static("public"));

app.get("/hello", (req, res) => {
  res.status(200).send("Hello World!");
});

io.on("connection", (socket) => {
  console.log("Alguien se ha conectado con Sockets");

  socket.on("join-room", (username) => {
    socket.join(username);
    console.log(`${username} se ha unido a la sala ${username}`);
  });

  socket.on("new-message", (data) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Cookie", "cookiesession1=678A3E10E82C9FD71F9E281AAD4522E9");

      const raw = JSON.stringify({
        "sesion": data.sesion ?? "",
        "comercio": data.comercio ?? "",
        "monto": data.monto  ?? 0,
        "usuario_id": data.usuario ?? 'SIN USUARIO',
        "accion": data.accion ?? 0
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      fetch("https://appsip.genesisempresarial.com/GEfectivoAdmin/api/LogBotonPago/InsertLogBotonPago", requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));

    } catch (e) {
      console.log(e);
    }

    messages.push(data);
    const messagesReturn = messages.filter((m) => m.sesion == data.sesion);
    const validos = messagesReturn.filter((m) => m.accion == 1);

    console.log(validos.length);
    io.to(data.sesion).emit("messages", validos.length != 0 ? messagesReturn : []);
  });
});

server.listen(8080, () => {
  console.log("Servidor corriendo en http://localhost:8080");
});
