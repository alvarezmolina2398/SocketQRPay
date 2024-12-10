const socket = io("https://devgefectivov2.site", {
    path: "/POSQR",
    transports: ['polling', 'websocket'],
    allowEIO3: true,
});

const generarCadenaAleatoria = (cantidad) => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let cadenaAleatoria = '';

    for (let i = 0; i < cantidad; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        cadenaAleatoria += caracteres.charAt(indice);
    }

    return cadenaAleatoria;
}

const montoTxt = $('#monto');
const sesionTxt = $('#sesion');

$(function () {
    $('#pn-error, #pn-exito, #pn-descripcion, #pn-qr, #textInicio, .textLoading, #textTime, #textError').hide();

    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    const comercio = urlParams.get('comercio');
    const monto = urlParams.get('monto');
    const usuario = urlParams.get('usuario');
    const sesion = urlParams.get('sesion');
    montoTxt.text('Q' + parseFloat(monto).toFixed(2));

    const sesionQR = generarCadenaAleatoria(6);
    sesionTxt.val(sesion);
    crearQr(comercio, sesion, monto, sesionQR);

    const fechaObjetivo = new Date();
    fechaObjetivo.setMinutes(fechaObjetivo.getMinutes() + 10);

    const intervalo = setInterval(() => {
        const ahora = new Date();
        const diferenciaTiempo = fechaObjetivo - ahora;

        if (diferenciaTiempo <= 0) {
            clearInterval(intervalo);
            socket.emit("new-message", { sesion, comercio, monto, accion: 5 });
        } else {
            const minutosRestantes = Math.floor((diferenciaTiempo / 1000 / 60) % 60);
            const segundosRestantes = Math.floor((diferenciaTiempo / 1000) % 60);
            $('#time').text(`${minutosRestantes} minutos ${segundosRestantes} segundos`);
        }
    }, 1000);

    socket.emit("join-room", sesion);
    socket.emit("new-message", { sesion, comercio, monto, accion: 1, usuario, sesionQR });

    socket.on("messages", function (data) {
        const message = data[data.length - 1];

        if (![0, 1, 2, 3, 4, 5].includes(message.accion)) return;

        $('#pn-qr, #pn-cargando, #pn-error, #pn-exito, #pn-descripcion, #textInicio, .textLoading, #time, #textError, #btnFixed').hide();

        switch (message.accion) {
            case 2:
                window.parent.postMessage({ event: 'cuotasGenesisAccion', data: { accion: 'escanear' } }, '*');
                $('#time, #pn-cargando').show();
                $('#pn-cargando').addClass("animate__fadeIn");
                break;

            case 3:
                clearInterval(intervalo);
                window.parent.postMessage({
                    event: 'cuotasGenesisAccion',
                    data: { accion: 'compra', datos: { trxPronet: message.trxPronet, trxByte: message.TransaccionByte } }
                }, '*');
                $('#pn-exito').show().addClass("animate__fadeIn");
                break;

            case 4:
                window.parent.postMessage({ event: 'cuotasGenesisAccion', data: { accion: 'error' } }, '*');
                $('#pn-error, #textError').show();
                $('#pn-error').addClass("animate__headShake");
                break;

            case 5:
                clearInterval(intervalo);
                window.parent.postMessage({ event: 'cuotasGenesisAccion', data: { accion: 'timeout' } }, '*');
                $('#textError, #pn-error').show();
                $('#pn-error').addClass("animate__headShake");
                break;

            case 0:
            case 1:
                window.parent.postMessage({ event: 'cuotasGenesisAccion', data: { accion: 'inicio' } }, '*');
                $('#time, #pn-qr, #pn-descripcion, #btnFixed').show();
                break;
        }
    });
});

const crearQr = (comercio, sesion, monto, sesionQR) => {
    const qrCode = new QRCodeStyling({
        width: 250,
        height: 250,
        type: "png",
        data: `${comercio}/${sesion}/${monto}/${sesionQR}`,
        dotsOptions: {
            type: "none",
            color: "#000",
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 3
        }
    });

    qrCode.append(document.getElementById("canvas"));
};
