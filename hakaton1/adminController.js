// adminController.js
const pool = require('./dbConfig.js');
const formidable = require('formidable');

const adminController = {
    // Funkcija za prikaz početne stranice welcomeAdminPanel
    welcome: (req, res) => {
        res.render('welcomeAdminPanel', { title: 'Dobrodošli na admin panel' });
    },
    //Funkcija za prikaz liste svih knjiga
    listAllBooks: (req, res) => {
        pool.query('SELECT * FROM knjiga order by naziv_knjige', (error, results) => {
            if (error) {
                console.error('Greška prilikom dohvatanja knjiga:', error);
                return res.status(500).send('Greška prilikom dohvatanja knjiga.');
            }
            res.render('listBooks', { title: 'Izlistane knjige', books: results });
        });
    },

    //Funkcija za dodavanje knjiga
    addBook: (req, res) => {
        const { naziv_knjige, autor, godina, zanr } = req.body;

        if (!naziv_knjige || !autor || !godina || !zanr) {
            return res.status(400).send('Svi podaci o knjizi su obavezni.');
        }

        const sql = 'INSERT INTO knjiga (naziv_knjige, autor, godina, zanr) VALUES (?, ?, ?, ?)';

        pool.query(sql, [naziv_knjige, autor, godina, zanr], (error, results) => {
            if (error) {
                console.error('Greška prilikom dodavanja knjige:', error);
                return res.status(500).send('Greška prilikom dodavanja knjige.');
            }
            res.redirect('/adminPanel/SveKnjige');
        });
    },

    //Funkcija za brisanje knjiga
    deleteBook: (req, res) => {
        const idKnjige = req.params.id;

        const deleteOmiljeneKnjigeQuery = `DELETE FROM omiljene_knjige WHERE id_knjige = ${idKnjige}`;

        pool.query(deleteOmiljeneKnjigeQuery, (errorOmiljeneKnjige, resultsOmiljeneKnjige) => {
            if (errorOmiljeneKnjige) {
                console.error('Greška prilikom brisanja povezanih podataka iz tabele OMILJENE_KNJIGE:', errorOmiljeneKnjige);
                return res.status(500).send('Greška prilikom brisanja povezanih podataka iz tabele OMILJENE_KNJIGE.');
            }

            const deleteKnjigaQuery = `DELETE FROM knjiga WHERE id_knjige = ${idKnjige}`;

            pool.query(deleteKnjigaQuery, (errorKnjiga, resultsKnjiga) => {
                if (errorKnjiga) {
                    console.error('Greška prilikom brisanja knjige:', errorKnjiga);
                    return res.status(500).send('Greška prilikom brisanja knjige.');
                }

                res.json({ success: true });
            });
        });
    },

    //Funkcija za prikaz liste svih korisnika
    listAllUsers: (req, res) => {
        pool.query('SELECT * FROM korisnici', (error, results) => {
            if (error) {
                console.error('Greška prilikom dohvatanja korisnika:', error);
                return res.status(500).send('Greška prilikom dohvatanja korisnika.');
            }
            res.render('listUsers', { title: 'Izlistani korisnici', users: results });
        });
    },

    //Funkcija za brisanje korisnika
    deleteUser: (req, res) => {
        const idKorisnik = req.params.id;

        if (!idKorisnik) {
            return res.status(400).send('Nedostaju podaci za brisanje korisnika.');
        }

        const getKorisnikQuery = `SELECT * FROM korisnici WHERE id_korisnik = ${idKorisnik}`;

        pool.query(getKorisnikQuery, (error, results) => {
            if (error) {
                console.error('Greška prilikom dohvaćanja korisnika:', error);
                return res.status(500).send('Greška prilikom brisanja korisnika.');
            }

            if (results.length === 0) {
                return res.status(404).send('Korisnik nije pronađen.');
            }

            const korisnik = results[0];

            if (korisnik.uloga === 'admin') {
                return res.status(403).send('Nemate dozvolu za brisanje administratora.');
            }

            const deleteFromOmiljeneKnjigeQuery = `DELETE FROM omiljene_knjige WHERE id_korisnik = ${idKorisnik}`;

            pool.query(deleteFromOmiljeneKnjigeQuery, (error, results) => {
                if (error) {
                    console.error('Greška prilikom brisanja iz omiljene_knjige tabele:', error);
                    return res.status(500).send('Greška prilikom brisanja korisnika.');
                }

                const deleteFromKorisniciQuery = `DELETE FROM korisnici WHERE id_korisnik = ${idKorisnik}`;

                pool.query(deleteFromKorisniciQuery, (error, results) => {
                    if (error) {
                        console.error('Greška prilikom brisanja korisnika:', error);
                        return res.status(500).send('Greška prilikom brisanja korisnika.');
                    }

                    res.json({ success: true });
                });
            });
        });
    },

    //Funkcija za rendanje forme za dodavanje knjige
    renderAddBookForm: (req, res) => {
        res.render('addBook', { title: 'Unesite podatke za dodavanje nove knjige' });
    },


};

module.exports = adminController;