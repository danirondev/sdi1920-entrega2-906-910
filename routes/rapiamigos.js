module.exports = function(app, gestorBD) {

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
};

