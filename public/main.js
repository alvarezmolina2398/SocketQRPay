var socket = io.connect("http://localhost:8080", { forceNew: true });




function render(data) {


    var pn2 = document.getElementById('pn-1');
    pn2.style.display = 'none';

    var pn2 = document.getElementById('pn-2');
    pn2.style.display = 'none';


    var pn3 = document.getElementById('pn-3');
    pn3.style.display = 'block';
}

function addMessage(e) {
    var message = {
        author: document.getElementById("author").value,  // Utiliza el nombre de usuario almacenado
        text: document.getElementById("texto").value,
    };

    socket.emit("new-message", message);
    return false;
}

function generarCadenaAleatoria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let cadenaAleatoria = '';

    for (let i = 0; i < 10; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        cadenaAleatoria += caracteres.charAt(indice);
    }

    return cadenaAleatoria;
}


document.addEventListener("DOMContentLoaded", function (event) {
    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    //Accedemos a los valores
    var comercio = urlParams.get('comercio');
    var monto = urlParams.get('monto');
   
    const sesion = generarCadenaAleatoria();

    // Obtener el nombre de usuario al iniciar sesión
    socket.emit("join-room", sesion);

    socket.on("messages", function (data) {

        var message = data[data.length - 1];
        if (message.accion == '2') {
            var pn1 = document.getElementById('pn-1');
            pn1.style.display = 'none';
            var pn3 = document.getElementById('right-side');
            pn3.style.display = 'none';
            var pn2 = document.getElementById('pn-2');
            pn2.style.display = 'block';
        } else if (message.accion == '3') {
            render(message);
        }

        // var message = data[data.length - 1];
        // setTimeout(() => {
        //     render(message);// Cambiar a 'inline', 'flex', 'grid' u otra propiedad según lo que necesites
        // }, 3000);

    });



    const qrCode = new QRCodeStyling({
        width: 280,
        height: 280,
        type: "png",
        data: `${comercio}/${sesion}/${monto}`,
        image: "/logo-divi.png",
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
            margin: 20
        }
    });

    qrCode.append(document.getElementById("canvas"));
});