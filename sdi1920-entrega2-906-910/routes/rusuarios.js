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
        app.get('logger').info("Usuario: "+req.session.usuario+" desconectado");
        req.session.usuario = null;
        res.redirect("/identificarse?mensaje=Te has desconectado");
    });

    app.get("/usuarios", function(req, res) {
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
                res.send("Error al listar");
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
                let respuesta = swig.renderFile('views/busuarios.html',
                    {
                        usuarios : usuarios,
                        paginas : paginas,
                        actual : pg,
                    });
                res.send(respuesta);
            }
        });
    });

    app.post('/usuario', function(req, res) {
        if (req.body.nombre == null || req.body.apellido == null || req.body.email == null || req.body.password == null){
            app.get('logger').error("Error de registro: campos incompletos");
            res.redirect("/registrarse?mensaje=Rellena todos los campos&tipoMensaje=alert-danger ");
        }
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let confirma = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.cpassword).digest('hex');

        if (seguro != confirma) {   //PROBLEMA SOLUCIONADO Y MEJORA DE SEGURIDAD(PONER EN INFORME)
            app.get('logger').error("Error de registro: las contraseñas no coinciden");
            res.redirect("/registrarse?mensaje=Las contraseñas no coinciden&tipoMensaje=alert-danger ");
        }else{
            let usuario = {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                email: req.body.email,
                password: seguro
            };
            let criterio = {email: req.body.email};
            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                if (usuarios.length != 0) {
                    app.get('logger').error("Error de registro: email existente");
                    res.redirect("/registrarse" +
                        "?mensaje=Email no valido" +
                        "&tipoMensaje=alert-danger ");
                } else {
                    gestorBD.insertarUsuario(usuario, function (id) {
                        if (id == null) {
                            res.redirect("/registrarse?mensaje=Error al registrar usuario&tipoMensaje=alert-danger ");
                        } else {
                            app.get('logger').info("Nuevo usuario registrado: "+req.body.email);
                            res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                        }
                    });
                }});
        }
    });

    app.post("/identificarse", function(req, res) {
        if(req.body.email==null || req.body.password==null){
            res.redirect("/identificarse" +
                "?mensaje=Rellena todos los campos"+
                "&tipoMensaje=alert-danger ");
        }
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        };
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                app.get('logger').error("Error de identificacion de usuario");
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                app.get('logger').info("Usuario "+usuarios[0].email+" identificado correctamente");
                res.redirect("/usuarios");
            }
        });
    });
};
