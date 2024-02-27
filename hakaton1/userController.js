const db = require('./dbConfig');
const formidable = require('formidable');
// Kontroler za prikaz svih knjiga
const showAllBooks = (req, res) => {
    db.query('SELECT * FROM knjiga order by naziv_knjige', (error, results) => {
        if (error) {
            console.error('Greška prilikom dohvaćanja podataka iz baze:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.render('userPanel', { knjige: results });
    });
};

// Kontroler za prikaz knjiga prema žanru
const showBooksByGenre = (req, res) => {
    const zanr = req.params.zanr.toLowerCase();

    db.query('SELECT * FROM knjiga WHERE zanr = ?', [zanr], (error, results) => {
        if (error) {
            console.error('Greška prilikom dohvaćanja podataka iz baze:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.render('userPanel', { knjige: results });
    });
};

// Kontroler za pretragu knjiga
const searchBooks = (req, res) => {
    const searchTerm = req.query.search;

    db.query('SELECT * FROM knjiga WHERE naziv_knjige LIKE ? OR autor LIKE ? OR godina = ?', [`%${searchTerm}%`, `%${searchTerm}%`, searchTerm], (error, results) => {
        if (error) {
            console.error('Greška prilikom pretrage knjiga:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.render('userPanel', { knjige: results });
    });
};

// Kontroler za dodavanje knjige u kolekciju
const addToCollection = (req, res) => {
        const { naziv_knjige, autor, godina, zanr } = req.body;

        db.query('INSERT INTO kolekcija (naziv_knjige, autor, godina, zanr) VALUES (?, ?, ?, ?)', [naziv_knjige, autor, godina, zanr], (error, results) => {
            if (error) {
                console.error('Greška prilikom dodavanja knjige u kolekciju:', error);
                return res.status(500).send({ message: 'Internal Server Error' });
            }

            res.status(200).send( 'Knjiga je dodana u kolekciju.');
        });
};

// Kontroler za prikaz kolekcije knjiga
const showCollection = (req, res) => {
    db.query('SELECT * FROM kolekcija', (error, results) => {
        if (error) {
            console.error('Greška prilikom dohvaćanja podataka iz kolekcije:', error);
            return res.status(500).send('Internal Server Error');
        }

        res.render('myCollection', { knjige: results });
    });
};

// Kontroler za brisanje knjige iz kolekcije
const deleteFromCollection = (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM kolekcija WHERE id_kolekcija = ?', [id], (error) => {
        if (error) {
            console.error('Greška prilikom brisanja knjige iz kolekcije:', error);
            return res.status(500).send('Internal Server Error');
        }

        res.status(200).send('Knjiga je izbrisana iz kolekcije.');
    });
};

module.exports = {
    showAllBooks,
    showBooksByGenre,
    searchBooks,
    addToCollection,
    showCollection,
    deleteFromCollection
};
