const { Router } = require('express');
const { check }  = require('express-validator');
const { actualizarUser, actualizarIMG } = require("../controllers/user/userController");
const { validarJWT }                    = require('../middlewares/validar-JWT');

const router = Router();

router.put('/:id', 
    validarJWT,
    actualizarUser);

router.put('/imagen/:id',
    validarJWT,
    actualizarIMG);

module.exports = router;