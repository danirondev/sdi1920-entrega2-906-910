module.exports = function(app, swig, gestorBD) {

    app.get("/invitaciones", function(req, res) {
        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }
        let criterio = {
            email: req.session.usuario
        };
        obtenerIdUser(criterio, function(criterio2) {
            gestorBD.obtenerInvitacionesPg(criterio2, pg, function (invitaciones, total) {
                if (invitaciones == null) {
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
                    let vec_emisores = [];
                    for (i = 0; i < invitaciones.length; i++)
                        vec_emisores.push(invitaciones[i].emisor);
                    let criterio = {email : {$in: vec_emisores}};
                    //PROBLEMA RESUELTO REALIZAMOS VECTOR DE EMAILS QUE POSTERIORMENTE BUSCAMOS EN EL GESTOR DE LA BD
                    gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                        let respuesta = swig.renderFile('views/invitaciones.html',
                            {
                                usuarios: usuarios,
                                paginas: paginas,
                                actual: pg,
                            });
                        res.send(respuesta);
                    });
                }
            });
        });
    });

    app.post('/invitaciones/:usuario_id', function (req, res) {
        if ( req.session.usuario == null) {
            res.redirect("/identificarse");
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
    //Funcion que obtiene el id tipo object dado un criterio que en este caso sería el email
    function obtenerIdUser(criterio, funcionCallback){
        gestorBD.obtenerUsuarios(criterio,function(usuarios){
            if(usuarios.length==0)
                funcionCallback(null);
            else{
                let criterio2={
                    usuario_id :  usuarios[0]._id
                };
                funcionCallback(criterio2);
            }
        })
    }
};