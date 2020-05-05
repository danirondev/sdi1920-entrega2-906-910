module.exports = function(app, swig, gestorBD) {

    app.post('/comentarios/:cancion_id', function (req, res) {
        if ( req.session.usuario == null) {
            res.send("No estas autenticado");
            return;
        }
        let comentario = {
            texto : req.body.texto,
            autor: req.session.usuario,
            cancion_id : gestorBD.mongo.ObjectID(req.params.cancion_id)
        }
        gestorBD.insertarComentario(comentario, function(id){
            if (id == null) {
                res.send("Error al insertar comentario");
            }
            else{
                res.redirect("/cancion/"+req.params.cancion_id);
            }
            });
    });
};