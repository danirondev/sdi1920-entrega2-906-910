module.exports = function(app, gestorBD) {

    app.get("/api/conversacion/:email", function (req, res) {

        if (req.body.texto.length==0){
            res.json({
                error: "El mensaje no puede estar vacio"
            })
        }
        usuarioValido(res.usuario, req.body.destino,function (valido) {
            if (!valido){
                res.json({
                    error: "El usuario de destino no existe o no es tu amigo"
                })
            } else {
                var mensaje = {
                    emisor: res.usuario,
                    destino: req.body.destino,
                    texto: req.body.texto,
                    leido: false
                };
                // ¿Validar nombre, genero, precio?
                gestorBD.insertarMensaje(mensaje, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje: "mensaje insertado",
                            _id: id
                        })
                    }
                });
            }
        });
    });

    app.post("/api/mensaje/:id", function (req, res) {

        if (req.body.texto.length==0){
            res.json({
                error: "El mensaje no puede estar vacio"
            })
        }
        usuarioValido(res.usuario, req.body.destino,function (valido) {
            if (!valido){
                res.json({
                    error: "El usuario de destino no existe o no es tu amigo"
                })
            } else {
                var mensaje = {
                    emisor: res.usuario,
                    destino: req.body.destino,
                    texto: req.body.texto,
                    leido: false
                };
                // ¿Validar nombre, genero, precio?
                gestorBD.insertarMensaje(mensaje, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje: "mensaje insertado",
                            _id: id
                        })
                    }
                });
            }
        });
    });

    function usuarioValido(emisor, receptor, funcionCallback){
       let criterio={
           email: receptor
       };
        gestorBD.obtenerUsuarios(criterio,function(usuarios){
            if(usuarios==null || usuarios.length==0)
                funcionCallback(false);
            else{
                let criterio2={$or: [
                        { amigoA_id :  usuarios[0]._id},
                        { amigoB_id :  usuarios[0]._id}]
                };
                gestorBD.obtenerAmigos(criterio2,function (amigos) {
                    if(amigos==null || amigos.length==0){
                        funcionCallback(false);
                    } else{
                        obtenerIdUser(emisor, function (id) {
                            for(i=0;i<amigos.length;i++){
                                if(amigos[i].amigoA_id==id || amigo[i].amigoB_id==id)
                                    funcionCallback(true);
                            }
                            funcionCallback(false);
                        })
                    }
                })
            }
        })
    }
    //Funcion que obtiene el id tipo object dado un criterio que en este caso sería el email
    function obtenerIdUser(criterio, funcionCallback){
        gestorBD.obtenerUsuarios(criterio,function(usuarios){
            if(usuarios.length==0)
                funcionCallback(null);
            else{
                let criterio2={
                    usuario_id :  gestorBD.mongo.ObjectID(usuarios[0]._id)
                };
                funcionCallback(criterio2);
            }
        })
    }
};