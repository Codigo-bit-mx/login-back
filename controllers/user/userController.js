const { request, response } = require('express');
const Usuario               = require('../../models/userModel');
const bcrypt                = require('bcryptjs');
const generacionJWT         = require('../../helpers/generacion-jwt');
const cloudinary            = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL); 


const newUsuario = async (req = request, res = response) => {
    
    const datoUsuario = req.body;
    const {nombre, cumpleaños, email, password} = datoUsuario;

    try{
        let usuario = await Usuario.findOne({email})
        if(usuario){
            return res.status(400).json({
                msg: 'Usuario Registrado'
            });
        }
        usuario = new Usuario({nombre, cumpleaños, email, password});
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );
        const token = await generacionJWT(usuario.id);
        await usuario.save();
        res.status(200).json({
            token,
            usuario });
    }catch(error){
        res.status(400).json({msg: "endpoint caido comunicate con el admin"});
    }
}

const obtenerUsuario = async (req, res) => {

    const id = req.usuario;
    try {
         const usuario = await Usuario.findById(id);
         if(!usuario){
            return res.status(401).json({
                  msg: "El usuario no se encontro"
              })
          }
          if(!usuario.estado) {
            return res.status(401).json({
                  msg: "El usuario no existe"
              })
          }
          res.status(200).json({usuario});

        } catch (error) {
        res.status(400).json({
            msg: 'error verifica con el admin'
        })
    }
}

const actualizarUser = async(req, res) => {
    const {id} = req.params;
    //lado izquierdo se excluye del lado derecho se incluye
    const { _id, ...argumentosRestantes } = req.body;
   
    try {
        let usuario =  await Usuario.findById(id);
        if(!usuario){
            res.status(400).json({
                msg: 'El usuario no existe'
            })
        }
        await Usuario.findByIdAndUpdate(id, argumentosRestantes);
        res.status(200).json({
            msg: "Actualizacion de datos exitosa"
        })  
    
    } catch (error) {
        res.status(400).json({
            msg:"Este endpoint falla comunicate con el admin"
        })
    }    
}


const actualizarIMG = async(req, res) => {
    const id = req.params;
    const { archivo } = req.files;
    // validacion de extencion
    const extencionesValidas =  ['jpg', 'jpeg', 'png'];
    const nombreCortado = archivo.name.split('.');
    const extencion = nombreCortado[nombreCortado.length - 1];
    if(!extencionesValidas.includes(extencion)) {
        res.status(400).json({
            msg: 'la imagen no es del formato correcto'
        })
    }
   
    try {
        const {secure_url} = await cloudinary.uploader.upload(archivo.tempFilePath, { folder: "/login" });
        await Usuario.findOneAndUpdate(id, {img: secure_url});
        res-status(200).json({
            msg: 'La imagem se actualizo con exito'
        })

    } catch (error) {
        res.status(400).json({
            msg: 'No se guardo la imagen revisa con el adm'
        })
    }
 
    
}

module.exports = {
    newUsuario,
    obtenerUsuario,
    actualizarUser,
    actualizarIMG
}