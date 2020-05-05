module.exports = function(app, swig, gestorBD) {
    app.get("/canciones", function(req, res) {

        let canciones =[ {
            "nombre" : "Blank space",
            "precio" : "1.2"
        }, {
            "nombre" : "See you again",
            "precio" : "1.3"
        }, {
            "nombre" : "Uptown funk",
            "precio" : "1.1"
        }];
        let respuesta = swig.renderFile('views/btienda.html', {
            vendedor: 'Tienda de canciones',
            canciones : canciones
        });

        res.send(respuesta);
    });

    app.get('/suma', function(req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(respuesta));
    });

    app.get('/canciones/agregar', function (req, res) {
        if ( req.session.usuario == null){
            res.redirect("/tienda");
            return;
        }
        let respuesta = swig.renderFile('views/bagregar.html', {

        });
        res.send(respuesta);
    })

    app.get('/canciones/:id', function(req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });

    app.get('/cancion/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let criterio2 = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
        //No necesitas comen_id
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            //si canciones es null, no llamamos a obtenerComentarios
            if (canciones == null)
                res.send(respuesta);
            else {
                cancionId=gestorBD.mongo.ObjectID(req.params.id);
                usuario=req.session.usuario;

                puedeComprar(usuario, cancionId, function(comprar){

                    gestorBD.obtenerComentarios(criterio2, function (comentarios) {
                        var configuracion = {
                            url: "https://api.exchangeratesapi.io/latest?base=EUR",
                            method: "get",
                            headers: {
                                "token": "ejemplo",
                            }
                        }
                        var rest = app.get("rest");
                        rest(configuracion, function (error, response, body) {
                            console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                            var objetoRespuesta = JSON.parse(body);
                            var cambioUSD = objetoRespuesta.rates.USD;
                            // nuevo campo "usd"
                            canciones[0].usd = cambioUSD * canciones[0].precio;
                            var respuesta = swig.renderFile('views/bcancion.html',
                                {
                                    cancion: canciones[0],
                                    comentarios: comentarios,
                                    //no queremos comentarios[0] (sería el primero)
                                    //enviamos todos (lista) los de la canción.
                                    puedecomprar: comprar

                                });
                            res.send(respuesta);
                        })
                    });
                })
                }
        });
    });

    app.get('/canciones/:genero/:id', function(req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'
            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });

    app.get("/tienda", function(req, res) {
        let criterio = {};
        if( req.query.busqueda != null ){
            criterio = { "nombre" :  {$regex : ".*"+req.query.busqueda+".*"} };
        }
        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerCancionesPg(criterio, pg , function(canciones, total ) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones : canciones,
                        paginas : paginas,
                        actual : pg
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion : canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let usuario=req.session.usuario;

        puedeComprar(usuario,cancionId,function(comprar){
            if(comprar){
                let compra = {
                    usuario : req.session.usuario,
                    cancionId : cancionId
                };
                gestorBD.insertarCompra(compra ,function(idCompra){
                    if ( idCompra == null ){
                        res.send(respuesta);
                    } else {
                        res.redirect("/compras");
                    }
                });
            } else
                next(new Error('Error al comprar la cancion ya comprada'));
        })


    });

    app.get('/compras',function(req,res){
        let criterio={ "usuario" : req.session.usuario };

        gestorBD.obtenerCompras(criterio,function(compras){
            if(compras==null)
                res.send("Error al listar ");
            else{
                let cancionesCompradasIds=[];
                for(i=0;i<compras.length;i++)
                    cancionesCompradasIds.push(compras[i].cancionId);
                let criterio={ "_id" : { $in: cancionesCompradasIds}};
                gestorBD.obtenerCanciones(criterio,function (canciones){
                    let respuesta=swig.renderFile('views/bcompras.html',{
                        canciones : canciones
                    });
                    res.send(respuesta);
                });
            }
        });
    });

    app.post("/cancion", function(req,res){
            if ( req.session.usuario == null) {
                res.redirect("/tienda");
                return;
            }
            let cancion = {
                nombre : req.body.nombre,
                genero : req.body.genero,
                precio : req.body.precio,
                autor: req.session.usuario
            };

        // Conectarse
        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                res.send("Error al insertar canción");
            } else {
                if (req.files.portada != null) {
                    let imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function(err) {
                        if (err) {
                            res.send("Error al subir la portada");
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/'+id+'.mp3', function(err) {
                                    if (err) {
                                        res.redirect("/publicaciones?mensaje=Error al insertar canción");
                                    } else {
                                        res.redirect("/publicaciones?mensaje=Nueva canción agregada");
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio
        };
        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if( result == null){
                        res.redirect("/publicaciones?mensaje=Error al modificar");
                    } else {
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    });
    function paso1ModificarPortada(files, id, callback){
        if (files && files.portada != null) {
            let imagen =files.portada;
            imagen.mv('public/portadas/' + id + '.png', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    }
    function paso2ModificarAudio(files, id, callback){
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    }

    function puedeComprar(usuario, idcancion, funcionCallback){
        let criterio_autor={$and: [
            {"_id": idcancion},
            {"autor" : usuario}]};
        let criterio_comprada={$and: [
                {"cancionId": idcancion},
                {"usuario" : usuario}]};
        gestorBD.obtenerCanciones(criterio_autor,function(canciones){
            if(canciones==null || canciones.length>0)
                funcionCallback(false);
            else{
                gestorBD.obtenerCompras(criterio_comprada,function(compras){
                    if(compras==null || compras.length>0)
                        funcionCallback(false);
                    else
                        funcionCallback(true);
                })
            }
        })
    }
    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    });

};
