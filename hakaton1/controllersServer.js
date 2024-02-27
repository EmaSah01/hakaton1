const bcrypt = require('bcrypt');
const passport = require('passport');
const connection = require('./dbConfig.js');

// Funkcija za prikaz početne stranice
exports.showIndex = (req, res) => {
    res.render('index');
};

// Funkcija za prikaz registracijske forme
exports.showRegister = (req, res) => {
    res.render('register');
};

// Funkcija za prikaz forme za prijavu
exports.showLogin = (req, res) => {
    res.render('login');
};

// Funkcija za odjavu korisnika
exports.logout = (req, res) => {
    //funkcija iz passporta za odjavu
    req.logOut(function(err) {
        if (err) {
            console.error(err);
            req.flash('error_msg', "Došlo je do pogreške prilikom odjave.");
            return res.redirect('/');
        }
        req.flash('success_msg', "Odjavio/la si se!");
        res.redirect('/login');
    });
};

// Funkcija za prikaz admin panela
exports.showAdminPanel = (req, res) => {
    res.render('adminPanel');
};

// Funkcija za prikaz user panela
exports.showUserPanel = (req, res) => {
    res.render('userPanel');
};

// Funkcija za registraciju korisnika
exports.registerUser = async (req, res) => {
    let { ime, prezime, email, korisnicko_ime, lozinka, lozinka2, uloga } = req.body;
    let errors = [];

    if (!ime || !prezime || !email || !korisnicko_ime || !lozinka || !lozinka2 || !uloga) {
        errors.push({ message: "Molimo unesite podatke za svako polje!" });
    }
    if (lozinka.length < 5) {
        errors.push({ message: "Lozinka mora imati najmanje 5 karaktera" });
    }
    if (lozinka !== lozinka2) {
        errors.push({ message: "Lozinke se ne poklapaju" });
    }
    if (errors.length > 0) {
        res.render('register', { errors });
    } else {
        try {
            let hashLozinka = await bcrypt.hash(lozinka, 10);

            const [existingUser] = await connection.promise().execute('SELECT * FROM korisnici WHERE korisnicko_ime=?', [korisnicko_ime]);

            if (existingUser.length > 0) {
                errors.push({ message: "Korisnik sa tim korisničkim imenom već postoji!" });
                res.render('register', { errors });
            } else {
                const [result] = await connection.promise().execute(
                    `INSERT INTO korisnici (ime, prezime, email, korisnicko_ime, lozinka, uloga)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [ime, prezime, email, korisnicko_ime, hashLozinka, uloga]
                );

                req.flash('success_msg', "Uspješno si registrovan/a! Prijavi se");
                res.redirect("/login");
            }
        } catch (err) {
            console.error('Greška prilikom izvršavanja upita', err);
            throw err;
        }
    }
};

// Funkcija za prijavu korisnika, passport midleware za lokalnu auten
//Ako autentifikacija ne uspije, preusmjerava na stranicu za prijavu s porukom o grešci.
exports.loginUser = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
});




