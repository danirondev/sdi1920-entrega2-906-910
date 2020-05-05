module.exports = function(app, swig, gestorBD) {

    app.post('/invitaciones/:usuario_id', function (req, res) {
        if ( req.session.usuario == null) {
            res.send("No estas autenticado"); //CAmbiar
            return;
        }
            let criterio={
                _id: gestorBD.mongo.ObjectID(req.params.usuario_id)
            };
            gestorBD.obtenerUsuarios(criterio,function (usuarios) {
                if (usuarios == null) {
                    res.send("Error");
                } else {
                    if(req.session.usuario==usuarios[0].email) //Comprobamos que no se puede enviar peticion a si mismo
                        res.redirect("/listausuarios?mensaje=No te puedes mandar solicitud a ti mismo");
                    else{
                        let criterio2={
                            emisor:req.session.usuario,
                            usuario_id: gestorBD.mongo.ObjectID(req.params.usuario_id)
                        };
                        gestorBD.obtenerInvitaciones(criterio2,function (invitaciones) {
                            //Si la longitud de las invitaciones que cumplen el criterio es distinto de 0 significa que ya hay una
                            // misma invitacion y no podremos realizar otra
                            if(invitaciones.length!=0){
                                res.redirect("/listausuarios?mensaje=Ya has mandado una solicitud a este usuario");
                            }else {
                                let invitacion = {
                                    emisor: req.session.usuario,
                                    usuario_id: gestorBD.mongo.ObjectID(req.params.usuario_id) //receptor
                                };
                                gestorBD.insertarInvitaciones(invitacion, function (id) {
                                    if (id == null) {
                                        res.send("Error al enviar solicitud");
                                    } else {
                                        res.redirect("/listausuarios");
                                    }
                                });
                            }
                        });
                    }
                }
            })
        });
};