//var socket = io.connect("https://rpgbq1fd-8080.use2.devtunnels.ms", { forceNew: true });
//var socket = io.connect('http://161.35.226.54:8080', { forceNew: true });
var socket = io.connect('http://localhost:8080', { forceNew: true });
// function render(data) {
//     var pn2 = document.getElementById('pn-1');
//     pn2.style.display = 'none';

//     var pn2 = document.getElementById('pn-2');
//     pn2.style.display = 'none';


//     var pn3 = document.getElementById('pn-3');
//     pn3.style.display = 'block';
// }

// function addMessage(e) {
//     var message = {
//         author: document.getElementById("author").value,  // Utiliza el nombre de usuario almacenado
//         text: document.getElementById("texto").value,
//     };

//     socket.emit("new-message", message);
//     return false;
// }

const generarCadenaAleatoria = (cantidad) => {
    //const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    var comercio = urlParams.get('comercio');
    var monto = urlParams.get('monto');
    montoTxt.text('Q' + parseFloat(monto).toFixed(2));
    const sesion = generarCadenaAleatoria(6);
    sesionTxt.val(sesion);
    crearQr(comercio, sesion, monto);
    $('#pn-cargando').hide();
    $('#pn-error').hide();
    $('#pn-exito').hide();
    $('#pn-descripcion').hide();
    $('#pn-qr').hide();
    $('#textInicio').hide();
    $('#textLoading').hide();
    $('#textTime').hide();
    $('#textError').hide();
    var fechaObjetivo = new Date();
    //fechaObjetivo.setMinutes(fechaObjetivo.getMinutes() + 5);
    fechaObjetivo.setSeconds(fechaObjetivo.getSeconds() + 15);
    var intervalo = setInterval(() => {
        var ahora = new Date();
        var diferenciaTiempo = fechaObjetivo - ahora;

        // Calcula minutos y segundos restantes
        var minutosRestantes = Math.floor((diferenciaTiempo / 1000 / 60) % 60);
        var segundosRestantes = Math.floor((diferenciaTiempo / 1000) % 60);

        if (diferenciaTiempo <= 0) {
            socket.emit("new-message", { sesion, comercio, monto, accion: 5 },);
        } else {
            // Muestra la cuenta regresiva
            $('#time').text(minutosRestantes + " minutos " + segundosRestantes + " segundos ");
        }

        // Si la cuenta regresiva ha alcanzado cero, realiza alguna acción adicional si es necesario

    }, 1000);





    socket.emit("join-room", sesion);
    socket.emit("new-message", { sesion, comercio, monto, accion: 1 },);


    socket.on("messages", function (data) {
        $('#pn-qr').hide();
        $('#pn-cargando').hide();
        $('#pn-error').hide();
        $('#pn-exito').hide();
        $('#pn-descripcion').hide();




        $('#textInicio').hide();
        $('#textLoading').hide();
        $('#textTime').hide();
        $('#textError').hide();
        var message = data[data.length - 1];


        if (message.accion == '2') {
            $('#textLoading').show();
            $('#pn-cargando').show();
            $('#pn-cargando').addClass("animate__fadeIn");
        }
        else if (message.accion == '3') {
            clearInterval(intervalo);
            $('#pn-exito').show();
            $('#pn-exito').addClass("animate__fadeIn");
        }
        else if (message.accion == '4') {
            $('#pn-error').show();
            $('#pn-error').addClass("animate__headShake");
            $('#textError').show();
        }
        else if (message.accion == '5') {
            clearInterval(intervalo);
            $('#textInicio').hide();
            $('#pn-error').show();
            $('#pn-error').addClass("animate__headShake");
            $('#textTime').show();
        }
        else if (message.accion == '0' || message.accion == '1') {
            $('#pn-qr').show();
            $('#pn-descripcion').show();
            $('#textInicio').show();
        }

    });
});



const crearQr = (comercio, sesion, monto) => {
    const qrCode = new QRCodeStyling({
        width: 250,
        height: 250,
        type: "png",
        data: `${comercio}/${sesion}/${monto}`,
        image: "img/logo-divi.png",
        dotsOptions: {
            type: "rounded",
            color: "#27275b",
            gradient: null
        },
        dotsOptionsHelper: {
            colorType: {
                single: true,
                gradient: false
            },
            gradient: {
                linear: true,
                radial: false,
                color1: "#6a1a4c",
                color2: "#6a1a4c",
                rotation: "0"
            }
        },
        cornersSquareOptions: {
            type: "extra-rounded",
            color: "#27275b"
        },
        cornersSquareOptionsHelper: {
            colorType: {
                single: true,
                gradient: false
            },
            gradient: {
                linear: true,
                radial: false,
                color1: "#27275b",
                color2: "#27275b",
                rotation: "0"
            }
        },
        cornersDotOptions: {
            type: "dot",
            color: "#27275b"
        },
        cornersDotOptionsHelper: {
            colorType: {
                single: true,
                gradient: false
            },
            gradient: {
                linear: true,
                radial: false,
                color1: "#000000",
                color2: "#000000",
                rotation: "0"
            }
        },
        backgroundOptionsHelper: {
            colorType: {
                single: true,
                gradient: false
            },
            gradient: {
                linear: true,
                radial: false,
                color1: "#ffffff",
                color2: "#ffffff",
                rotation: "0"
            }
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 3
        }
    });

    qrCode.append(document.getElementById("canvas"));
}


