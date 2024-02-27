const express = require('express');
const router = express.Router();
const userController = require('../userController');

// Ruta za prikaz svih knjiga
router.get('/', userController.showAllBooks);

// Ruta za prikaz knjiga prema žanru
router.get('/genre/:zanr', userController.showBooksByGenre);

// Ruta za pretragu knjiga
router.get('/search', userController.searchBooks);

router.get('/addToConnection', userController.addToCollection);


// Ruta za dodavanje knjige u kolekciju
router.post('/addToCollection', userController.addToCollection);

// Ruta za prikaz kolekcije knjiga
router.get('/kolekcija', userController.showCollection);

// Ruta za brisanje knjige iz kolekcije
router.delete('/deleteFromCollection/:id', userController.deleteFromCollection);

module.exports = router;
