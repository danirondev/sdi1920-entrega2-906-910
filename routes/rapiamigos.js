module.exports = function(app, gestorBD) {

    app.get("/api/amigosW/", function (req, res) {
        var criterio = {
            email: res.usuario
        };
        listaAmigosW(criterio, function (amigos) {
            if (amigos == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(amigos));
            }
        });
    });

    app.get("/api/amigos/", function (req, res) {
        var criterio = {
            email: res.usuario
        };
        listaAmigos(criterio, function (amigos) {
            if (amigos == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(amigos)); //Solo mostramos su email porque así lo determinamos en la funcion listaAmigos
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

    function listaAmigosW(criterio, funcionCallback){
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
                        let vec_amigos_email = [];
                        let vec_amigos_nombre = [];
                        let vec_amigos_ids = [];
                        for (i = 0; i < amigos.length; i++) {
                            if (amigos[i].amigoA_id.email === usuarios[0].email) {
                                vec_amigos_ids.push(i);
                                vec_amigos_email.push(amigos[i].amigoB_id.email); //Guardamos su email
                                vec_amigos_nombre.push(amigos[i].amigoB_id.nombre); //Guardamos su nombre
                            } else {
                                vec_amigos_ids.push(i);
                                vec_amigos_email.push(amigos[i].amigoA_id.email);
                                vec_amigos_nombre.push(amigos[i].amigoA_id.nombre); }
                        }
                        JSON.stringify(vec_amigos_email);
                        JSON.stringify(vec_amigos_nombre);
                        JSON.stringify(vec_amigos_ids);
                        let vec_amigos = {
                            "amigos_ids": vec_amigos_ids,
                            "amigos_nombres": vec_amigos_nombre,
                            "amigos_email": vec_amigos_email
                        };
                        funcionCallback(vec_amigos);
                    });
                }
            });
        }
    }
};