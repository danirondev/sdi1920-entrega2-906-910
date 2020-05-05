module.exports = function(app, swig) {

    app.get("/autores", function(req, res) {

        let autores =[ {
            "nombre" : "DarkNEt",
            "grupo" : "PUNK Metal",
            "role" : "bateria"
        }, {
            "nombre" : "Lorean",
            "grupo" : "El loko",
            "role" : "bajista"
        }, {
            "nombre" : "Alberto",
            "grupo" : "GospelYOU",
            "role" : "cantante"
        }];
        let respuesta = swig.renderFile('views/autores.html', {
            autores : autores
        });

        res.send(respuesta);
    });

    app.get('/autores/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {

        });
        res.send(respuesta);
    })

    app.post("/autores", function(req,res){
        let nombre=req.body.nombre;
        let grupo=req.body.grupo;
        let role=req.body.role;

        if(nombre=="undefined")
            nombre="<Parametro>";

        else if(grupo=="undefined")
        grupo="<Parametro>";

        else if(role=="undefined")
            role="<Parametro>";

        res.send("Nombre: "+nombre + "<br>"
            + " grupo : "+ grupo + "<br>"
            + " role : "+ role);
    });

    app.get('/autores*', function (req, res) {
        res.redirect('autores/');
    });


};
