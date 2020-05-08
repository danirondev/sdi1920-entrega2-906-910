module.exports = function(app, gestorBD) {

    app.get("/api/conversacion/:email", function (req, res) {

        if (req.body.texto.length==0){
            res.json({
                error: "El mensaje no puede estar vacio"
            })
        }
        //let criterio={email:res.usuario};
        usuarioValido(res.usuario, req.body.destino,function (valido) {
       // listaAmigos(criterio,function (amigos) {
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
        //});
        });
    });

    app.post("/api/mensaje/", function (req, res) {

        if (req.body.destino==null || req.body.destino.length==0){
            res.json({
                error: "El mensaje tiene que tener un destinatario"
            })
        }
        //let criterio={email:res.usuario};
        usuarioValido(res.usuario, req.body.destino,function (valido) {
       // listaAmigos(criterio,function (amigos) {
         //   if(amigos==null || amigos.length==0) {
            if(!valido) {
                res.status(500);
                res.json({
                    error: "El destinatario no existe o no es tu amigo"
                })
            } else {
                var mensaje = {
                    emisor: res.usuario,
                    destino: req.body.destino,
                    texto: req.body.texto,
                    leido: false
                };
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

    function usuarioValido(emisor,receptor, callback){
       let criterio={
           email: emisor
       };
       listaAmigos(criterio,function(amigos){
           if(amigos==null)
               callback(false);
           else {
               for (i = 0; i < amigos.length; i++) {
                   if (amigos[i] == receptor) {
                       callback(true);
                   }
               }
               callback(false);
           }
       });
    }

    function listaAmigos(criterio, funcionCallback){
        if(criterio==null)
            funcionCallback(null);
        else {
            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                if (usuarios.length == 0)
                    funcionCallback(null);
                else {
                    let criterio2 = {
                        $or: [
                            {amigoA_id: usuarios[0]},
                            {amigoB_id: usuarios[0]}]
                    };
                    gestorBD.obtenerAmigos(criterio2, function (amigos) {
                        let vec_amigos = [];
                        for (i = 0; i < amigos.length; i++) {
                            if (amigos[i].amigoA_id.email === usuarios[0].email)
                                vec_amigos.push(amigos[i].amigoB_id.email);
                            else
                                vec_amigos.push(amigos[i].amigoA_id.email);
                        }
                        funcionCallback(vec_amigos);
                    });
                }
            });
        }
    }
};