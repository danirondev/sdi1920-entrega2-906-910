module.exports = function(app, swig, gestorBD) {

    app.get("/amigos", function(req, res) {
        let pg = parseInt(req.query.pg);
        if ( req.query.pg == null) {
            pg = 1;
        }
        let criterio = {
            email: req.session.usuario
        };
        gestorBD.obtenerUsuarios(criterio,function (usuarios) {
            if(usuarios.length==0)
                res.redirect("/usuarios?mensaje=Ha ocurrido un error&tipoMensaje=alert-danger ");
            else {
                let criterio_amigo={$or: [
                        { amigoA_id :  usuarios[0]},
                        { amigoB_id :  usuarios[0]}]
                };
                gestorBD.obtenerAmigosPg(criterio_amigo, pg, function (amigos, total) {
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
                        let vec_amigos = [];
                        for (i = 0; i < amigos.length; i++) {
                            if (amigos[i].amigoA_id.email === usuarios[0].email)
                                vec_amigos.push(amigos[i].amigoB_id);
                            else
                                vec_amigos.push(amigos[i].amigoA_id);
                        }
                        let respuesta = swig.renderFile('views/bamigos.html',
                            {
                                usuarios: vec_amigos,
                                paginas: paginas,
                                actual: pg,
                            });
                        res.send(respuesta);
                });
            }
        });
    });

    app.post('/amigos/aceptar/:usuario_id', function (req, res) {
        let criterio={$or: [
                { email:req.session.usuario },
                { _id : gestorBD.mongo.ObjectID(req.params.usuario_id)}]
        };
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if(usuarios.length==0)
                res.redirect("/usuarios?mensaje=Ha ocurrido un error&tipoMensaje=alert-danger");
            else{
                let amistad={
                    amigoA_id :  usuarios[0],
                    amigoB_id :  usuarios[1]
                };
                gestorBD.insertarAmigo(amistad,function (id) {
                    if (id == null) {
                        res.redirect("/amigos?mensaje=Ha ocurrido un error&tipoMensaje=alert-danger");
                    } else {
                        obtenerEmailUser(gestorBD.mongo.ObjectID(req.params.usuario_id),function(emailUser){
                           let usuarioValido;
                            if(usuarios[1].email==req.session.usuario) {
                                usuarioValido=usuarios[1]._id;
                            }else{
                                usuarioValido=usuarios[0]._id;
                            }
                            let criterio_eliminacion={
                                $and: [
                                    {emisor: emailUser},
                                    {usuario_id: usuarioValido}]
                            };
                            app.get('logger').info("El usuario "+req.session.usuario+" ha aceptado la solicitud de "+emailUser);
                            gestorBD.eliminarInvitacion(criterio_eliminacion,function (invitaciones) {
                                if(invitaciones==null){
                                    res.send("Error");
                                }else {
                                    res.redirect("/invitaciones");
                                }
                            });
                        });
                    }
                })
            }
        })
    });
    //Funcion que obtiene el email dado un criterio que en este caso sería el id del usuario
    function obtenerEmailUser(id_usuario, funcionCallback){
        gestorBD.obtenerUsuarios(id_usuario,function(usuarios){
            if(usuarios.length==0)
                funcionCallback(null);
            else{
                let email=usuarios[0].email;
                funcionCallback(email);
            }
        })
    }
};