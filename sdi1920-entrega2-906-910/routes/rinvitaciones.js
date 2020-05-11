module.exports = function(app, swig, gestorBD) {

    app.get("/invitaciones", function (req, res) {
        let pg = parseInt(req.query.pg);
        if (req.query.pg == null) {
            pg = 1;
        }
        let criterio = {
            email: req.session.usuario
        };
        obtenerIdUser(criterio, function (criterio2) {
            gestorBD.obtenerInvitacionesPg(criterio2, pg, function (invitaciones, total) {
                    let ultimaPg = total / 5;
                    if (total % 5 > 0) { // Sobran decimales
                        ultimaPg = ultimaPg + 1;
                    }
                    let paginas = []; // paginas mostrar
                    for (let i = pg - 2; i <= pg + 2; i++) {
                        if (i > 0 && i <= ultimaPg) {
                            paginas.push(i);
                        }
                    }
                    let vec_emisores = [];
                    for (i = 0; i < invitaciones.length; i++)
                        vec_emisores.push(invitaciones[i].emisor);
                    let criterio = {email: {$in: vec_emisores}};
                    //PROBLEMA RESUELTO REALIZAMOS VECTOR DE EMAILS QUE POSTERIORMENTE BUSCAMOS EN EL GESTOR DE LA BD
                    gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                        let respuesta = swig.renderFile('views/binvitaciones.html',
                            {
                                usuarios: usuarios,
                                paginas: paginas,
                                actual: pg,
                            });
                        res.send(respuesta);
                    });
            });
        });
    });

    app.post('/invitaciones/:usuario_id', function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/usuarios");
            return;
        } else {
            let criterio = {
                $or: [
                    {_id: gestorBD.mongo.ObjectID(req.params.usuario_id)},
                    {email: req.session.usuario}]
            };
            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                if (usuarios == null) {
                    res.send("Error");
                } else {
                    if(usuarios.length==1){//Comprobamos que no se puede enviar peticion a si mismo
                        res.redirect("/usuarios?mensaje=No te puedes mandar solicitud a ti mismo&tipoMensaje=alert-danger");
                    } else {
                        let criterio_amigo = {
                            $or: [
                                {
                                    $and: [
                                        {amigoA_id: usuarios[1]},
                                        {amigoB_id: usuarios[0]}]
                                },
                                {
                                    $and: [
                                        {amigoA_id: usuarios[0]},
                                        {amigoB_id: usuarios[1]}]
                                }
                            ]
                        };
                        esAmigo(criterio_amigo, function (es_amigo) {
                            if (es_amigo)
                                res.redirect("/usuarios?mensaje=Este usuario ya es tu amigo");
                            else {
                                let criterio2 = {
                                    emisor: req.session.usuario,
                                    usuario_id: gestorBD.mongo.ObjectID(req.params.usuario_id)
                                };
                                gestorBD.obtenerInvitaciones(criterio2, function (invitaciones) {
                                    //Si la longitud de las invitaciones que cumplen el criterio es distinto de 0 significa que ya hay una
                                    // misma invitacion y no podremos realizar otra
                                    if (invitaciones.length != 0) {
                                        res.redirect("/usuarios?mensaje=Ya has mandado una solicitud a este usuario");
                                    } else {
                                        let invitacion = {
                                            emisor: req.session.usuario,
                                            usuario_id: gestorBD.mongo.ObjectID(req.params.usuario_id) //receptor
                                        };
                                        gestorBD.insertarInvitaciones(invitacion, function (id) {
                                            if (id == null) {
                                                res.redirect("/usuarios?mensaje=Error al mandar solicitud&tipoMensaje=alert-danger");
                                            } else {
                                                res.redirect("/usuarios");
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });

    //Funcion que obtiene el id tipo object dado un criterio que en este caso sería el email
    function obtenerIdUser(criterio, funcionCallback) {
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios.length == 0)
                funcionCallback(null);
            else {
                let criterio2 = {
                    usuario_id: usuarios[0]._id
                };
                funcionCallback(criterio2);
            }
        })
    }

    //Funcion que determina si un usuario es amigo
    function esAmigo(criterio, funcionCallback) {
        gestorBD.obtenerAmigos(criterio, function (amigos) {
            if (amigos.length == 0 || amigos == null)
                funcionCallback(false);
            else {
                funcionCallback(true);
            }
        })
    }
}
