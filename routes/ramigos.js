module.exports = function(app, swig, gestorBD) {

    app.get("/amigos", function(req, res) {
        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }
        let criterio = {
            email: req.session.usuario
        };
        gestorBD.obtenerUsuarios(criterio,function (usuarios) {
            if(usuarios.length==0)
                res.send("Error al listar ");
            else {
                let criterio2={$or: [
                        { amigoA_id : usuarios[0]._id},
                        { amigoB_id : usuarios[0]._id}]
                };
                gestorBD.obtenerAmigosPg(criterio2, pg, function (amigos, total) {
                    if (amigos == null) {
                        res.send("Error al listar ");
                    } else {
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
                        let vec_amigosId = [];
                        obtenerIdUser(req.session.usuario, function (id) {
                            for (i = 0; i < amigos.length; i++) {
                                if (amigos[i].amigoA_id == id)
                                    vec_amigosId.push(amigos[i].amigoB_id);
                                else
                                    vec_amigosId.push(amigos[i].amigoA_id);
                            }
                        });
                        let criterio3 = {_id: {$in: vec_amigosId}};
                        gestorBD.obtenerUsuarios(criterio3, function (usuarios) {
                            let respuesta = swig.renderFile('views/bamigos.html',
                                {
                                    amigos: amigos,
                                    paginas: paginas,
                                    actual: pg,
                                });
                            res.send(respuesta);
                        });
                    }
                });
            }
        });
    });

    app.post('/amigos/aceptar/:usuario_id', function (req, res) {
        let criterio={
            email:req.session.usuario
        };
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if(usuarios.length==0)
                res.redirect("/listausuarios");
            else{
                let criterio2={
                    amigoA_id :  usuarios[0]._id,
                    amigoB_id :  gestorBD.mongo.ObjectID(req.params.usuario_id)
                };
                gestorBD.insertarAmigo(criterio2,function (id) {
                    if (id == null) {
                        res.send("Error al insertar amigo");
                    } else {
                        obtenerEmailUser(gestorBD.mongo.ObjectID(req.params.usuario_id),function(emailUser){
                            //PROBLEMA RESUELTO PONER EL CRITERIO DE ELIMINACION DE FORMA UNICA Y QUE CUMPLA LAS DOS CONDICIONES
                            let criterio_eliminacion={$and: [
                                    { emisor : emailUser},
                                    {usuario_id : gestorBD.mongo.ObjectID(usuarios[0]._id)}]
                            };
                        gestorBD.eliminarInvitacion(criterio_eliminacion,function (invitaciones) {
                            if(invitaciones==null){
                                res.send("Error");
                            }else
                                res.redirect("/invitaciones");
                        });
                        });
                    }
                })
            }
        })
    });
    //Funcion que obtiene el email dado un criterio que en este caso sería el id del usuario
    function obtenerEmailUser(criterio, funcionCallback){
        gestorBD.obtenerUsuarios(criterio,function(usuarios){
            if(usuarios.length==0)
                funcionCallback(null);
            else{
                let email=usuarios[0].email;
                funcionCallback(email);
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