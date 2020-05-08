module.exports = function(app, gestorBD) {

    app.get("/api/mensajes/:_id", function (req, res) {
        var criterio = {
            _id: gestorBD.mongo.ObjectID(req.params._id)
        };
        gestorBD.obtenerUsuarios(criterio,function (usuarios) {
            if(usuarios==null || usuarios.length==0){
                res.status(500);
                res.json({
                    error: "el usuario no existe"
                })
            }else {
                let criterio2={
                    $or: [
                        {
                            $and: [
                                {emisor: res.usuario},
                                {destino: usuarios[0].email}]
                        },
                        {
                            $and: [
                                {emisor: usuarios[0].email},
                                {destino: res.usuario}]
                        }
                    ]
                };
                gestorBD.obtenerMensajes(criterio2, function (mensajes) {
                    if (mensajes == null || mensajes.length==0) {
                        res.status(500);
                        res.json({
                            error: "No hay mensajes"
                        })
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(mensajes));
                    }
                });
            }
        });
    });

    app.post("/api/mensaje/", function (req, res) {
        if (req.body.destino==null || req.body.destino.length==0){
            res.json({
                error: "El mensaje tiene que tener un destinatario"
            })
        }
        let criterio={email:res.usuario};
        listaAmigos(criterio,function (amigos) {
            if(amigos==null || amigos.length==0) {
                res.status(500);
                res.json({
                    error: "No tienes amigos agregados"
                })
            } else {
                let esAmigo = false;
                for (i = 0; i < amigos.length; i++) {
                    if (amigos[i] == req.body.destino) {
                        esAmigo = true;
                    }
                }
                if (!esAmigo) {
                    res.status(500);
                    res.json({
                        error: "El destinatario no existe o no es tu amigo"
                    })
                }else {
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
            }
        });
    });

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
                                vec_amigos.push(amigos[i].amigoB_id.email); //Guardamos su email
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