const express = require('express');
const router = express.Router();
const pool = require('../dbConfig.js');

const adminController = require('../adminController');

// Dobrodošli na admin panel
router.get('/', adminController.welcome);

//Izlistavanje svih knjiga
router.get('/SveKnjige', adminController.listAllBooks);

// Izlistavanje svih korisnika
router.get('/SviKorisnici', adminController.listAllUsers);

// Brisanje korisnika
router.delete('/SviKorisnici/:id', adminController.deleteUser);

// Brisanje knjige
router.delete('/SveKnjige/:id', adminController.deleteBook);

router.get('/SveKnjige/dodajKnjigu', adminController.renderAddBookForm);
router.post('/SveKnjige/dodajKnjigu', adminController.addBook);



// Azuriranje forme sa podacima o knjizi
router.post('/SveKnjige/azurirajKnjigu', (req, res) => {
    const id_knjige = req.body.id_knjige;
    console.log(id_knjige)
    console.log("desio se post prebacivanje")
    // Dohvatite podatke o knjizi iz baze podataka na osnovu ID-a
    pool.query('SELECT * FROM knjiga WHERE id_knjige = ?', [id_knjige], (error, results) => {
        if (error) throw error;

        // Renderujte formu za ažuriranje sa trenutnim podacima o knjizi
        res.render('azurirajKnjigu', { book: results[0]});
    });
});

// Ažuriranje podataka o knjizi

const formidable = require('formidable');
//
router.put('/SveKnjige/azurirajKnjigu', (req, res) => {
    console.log("Desio se put");

    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
        if (err) {
            console.error('Greška prilikom parsiranja forme:', err);
            return res.status(500).send('Interna server greška.');
        }

        const id_knjige = fields.id_knjige;
        const naziv_knjige = fields.naziv_knjige;
        const autor = fields.autor;
        const zanr = fields.zanr;
        const godina = fields.godina;

        // Provjera vrijednosti prije ažuriranja
        if (!naziv_knjige) {
            return res.status(400).send('Naziv knjige ne može biti prazan.');
        }

        // Izvršite SQL upit za ažuriranje podataka o knjizi
        pool.query(
            'UPDATE knjiga SET naziv_knjige=?, autor=?, zanr=?, godina=? WHERE id_knjige=?',
            [naziv_knjige, autor, zanr, godina, id_knjige],
            (error, results) => {
                if (error) {
                    console.error('Greška prilikom izvršavanja upita:', error);
                    return res.status(500).send('Interna server greška.');
                }

                // Slanje odgovora nakon ažuriranja
                return res.status(200).send({ success: true });
            }
        );
    });
});


module.exports = router;