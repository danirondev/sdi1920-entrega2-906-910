module.exports = function(app, swig, gestorBD) {

    app.post('/amigos/:usuario_id', function (req, res) {
        let criterio={
            email:req.session.usuario
        };
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if(usuarios.length==0)
                res.redirect("/listausuarios");
            else{
                let criterio2={
                    amigoA_id :  gestorBD.mongo.ObjectID(usuarios[0]._id),
                    amigoB_id :  gestorBD.mongo.ObjectID(req.params.usuario_id)
                };
                gestorBD.insertarAmigo(criterio2,function (id) {
                    if (id == null) {
                        res.send("Error al insertar amigo");
                    } else {
                        let criterio_eliminacion={$and: [
                            { emisor : req.params.usuario_id},
                            {usuario_id : gestorBD.mongo.ObjectID(usuarios[0]._id)}]
                        };
                        gestorBD.eliminarInvitacion(criterio_eliminacion,function (invitaciones) {
                            if(invitaciones==null){
                                res.send("Error");
                            }else
                                res.redirect("/invitaciones");
                        });
                    }
                })
            }
        })
    });
};