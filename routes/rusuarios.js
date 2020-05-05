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

    app.get("/usuarios", function(req, res) {
        let criterio = { autor : req.session.usuario };
        gestorBD.obtenerCanciones(criterio, function(canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/listausuarios.html',
                    {
                        canciones : canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.post('/usuario', function(req, res) {
        if(req.body.nombre==null || req.body.apellido==null || req.body.email==null || req.body.password==null)
            res.redirect("/registrarse?mensaje=Rellena todos los campos");
        if(req.body.password!=req.body.cpassword)
            res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            nombre : req.body.nombre,
            apellido : req.body.apellido,
            email : req.body.email,
            password : seguro
        }
        let criterio={ email : req.body.email };
        gestorBD.obtenerUsuarios(criterio,function (usuarios) {
            if (usuarios.length !=0) {
                res.redirect("/registrarse" +
                    "?mensaje=Email no valido"+
                    "&tipoMensaje=alert-danger ");
            } else {
            gestorBD.insertarUsuario(usuario, function(id) {
                if (id == null){
                    res.redirect("/registrarse?mensaje=Error al registrar usuario");
                } else {
                    res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                }
            }); }
        });
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
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/usuarios");            }
        });
    });

    function noconectado(funcionCallback){
        let user={email:req.session.usuario};
        if(email == null)
            funcionCallback(true);
        else
            funcionCallback(false);
    }


};
