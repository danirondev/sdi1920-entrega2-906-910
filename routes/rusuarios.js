module.exports = function(app, swig, gestorBD) {

    app.get("/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.get("/identificarse", function(req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/identificarse?mensaje=Te has desconectado");
    });

    app.get("/listausuarios", function(req, res) {
        let criterio = {};
        if( req.query.busqueda != null ) {
            criterio = {
                $or: [      //PROBLEMA SOLUCIONADO BUSCAR POR NOMBRE, EMAIL O APELLIDO INCLUIR EN MEMORIA
                    {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}},
                    {"apellido": {$regex: ".*" + req.query.busqueda + ".*"}},
                    {"email": {$regex: ".*" + req.query.busqueda + ".*"}}]
            };
        }
            let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerUsuariosPg(criterio, pg , function(usuarios, total ) {
            if (usuarios == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total/5;
                if (total % 5 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/listausuarios.html',
                    {
                        usuarios : usuarios,
                        paginas : paginas,
                        actual : pg,
                        usuario_sesion :  req.session.usuario
                    });
                res.send(respuesta);
            }
        });
    });
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

    app.post('/usuario', function(req, res) {
        if (req.body.nombre == null || req.body.apellido == null || req.body.email == null || req.body.password == null)
            res.redirect("/registrarse?mensaje=Rellena todos los campos");
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let confirma = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.cpassword).digest('hex');

        if (seguro == confirma) {   //PROBLEMA SOLUCIONADO Y MEJORA DE SEGURIDAD(PONER EN INFORME)
            let usuario = {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                email: req.body.email,
                password: seguro
            };
            let criterio = {email: req.body.email};
            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                if (usuarios.length != 0) {
                    res.redirect("/registrarse" +
                        "?mensaje=Email no valido" +
                        "&tipoMensaje=alert-danger ");
                } else {
                    gestorBD.insertarUsuario(usuario, function (id) {
                        if (id == null) {
                            res.redirect("/registrarse?mensaje=Error al registrar usuario");
                        } else {
                            res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                        }
                    });
                }});
        }else{
            res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
        }
    });

    app.post("/identificarse", function(req, res) {
        if(req.body.email==null || req.body.password==null)
            res.redirect("/identificarse" +
                "?mensaje=Rellena todos los campos"+
                "&tipoMensaje=alert-danger ");
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        };
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/listausuarios");            }
        });
    });
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
