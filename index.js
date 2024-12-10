import express from "express";
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  path: '/POSQR', // La ruta debe coincidir exactamente con lo esperado por NGINX y el cliente
  transports: ['polling', 'websocket'],
  cors: {
    origin: false,
  },
});


// Almacén de mensajes
let messages = [];

// Middleware para servir archivos estáticos
app.use(express.static("public"));

// Ruta básica para pruebas
app.get("/hello", (req, res) => {
  res.status(200).send("Hello World!");
});

// Manejo de conexión de sockets
io.on("connection", (socket) => {
  console.log("Cliente conectado al servidor Socket.IO en /POSQR");

  // Manejo de desconexión
  socket.on("disconnect", (reason) => {
    console.log(`Socket desconectado: ${reason}`);
  });

  // Unir al cliente a una sala
  socket.on("join-room", (username) => {
    if (!username) {
      console.error("Nombre de usuario inválido");
      return;
    }
    socket.join(username);
    console.log(`${username} se ha unido a la sala ${username}`);
  });

  // Manejo de mensajes nuevos
  socket.on("new-message", async (data) => {
    try {
      // Validación básica
      if (!data.sesion || typeof data.accion === 'undefined') {
        console.error("Datos inválidos recibidos:", data);
        return;
      }

      console.log("Procesando nuevo mensaje:", data);

      // Llamada al API externo
      const url = "https://appsip.genesisempresarial.com/GEfectivoAdminDes/api/LogBotonPago/InsertLogBotonPago";
      const payload = {
        sesion: data.sesion ?? "",
        comercio: data.comercio ?? "",
        monto: data.monto ?? 0,
        usuario_id: data.usuario ?? "SIN USUARIO",
        accion: data.accion.toString() ?? "0",
        referenciaByte: data.TransaccionByte ?? "N/A",
        referenciaPronet: data.trxPronet ?? "N/A",
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": "cookiesession1=678A3E10E82C9FD71F9E281AAD4522E9",
        },
        body: JSON.stringify(payload),
      };

      const response = await fetch(url, requestOptions);
      const result = await response.text();
      console.log("Respuesta del API:", result);

      // Configuración de timeout si la acción es 1
      if (data.accion === 1) {
        const milliseconds = 10 * 60 * 1000; // 10 minutos
        setTimeout(() => {
          const qrUrl = `https://devgefectivov2.site/QrPosApi/v1/enviar-mensaje/${data.sesion}/5/${data.sesionQR}`;
          fetch(qrUrl, { method: "GET" })
            .then((res) => console.log("QR Timeout enviado:", res.status))
            .catch((err) => console.error("Error enviando QR Timeout:", err));
        }, milliseconds);
      }

      // Agregar mensaje a la lista
      messages.push(data);

      // Filtrar mensajes válidos y emitirlos a la sala
      const messagesReturn = messages.filter((m) => m.sesion === data.sesion);
      const validos = messagesReturn.filter((m) => m.accion === 1);
      io.to(data.sesion).emit("messages", validos.length !== 0 ? messagesReturn : []);

      // Limpiar mensajes si la acción es 3, 4 o 5
      if ([3, 4, 5].includes(data.accion)) {
        messages = messages.filter((m) => m.sesionQR !== data.sesionQR);
      }
    } catch (error) {
      console.error("Error procesando el mensaje:", error);
    }
  });
});

// Servidor escuchando
server.listen(8082, () => {
  console.log("Servidor corriendo en http://localhost:8082");
});
