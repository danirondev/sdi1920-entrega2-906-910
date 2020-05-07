module.exports = function(app, gestorBD) {

    app.get("/api/amigos/", function (req, res) {
        var criterio = {
            email: res.usuario};
        obtenerIdUser(criterio,function (id) {
            gestorBD.obtenerAmigos(id, function (amigos) {
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
