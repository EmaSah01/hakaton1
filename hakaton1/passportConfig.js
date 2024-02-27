//konekcija
const pool = require('./dbConfig.js');
//hashiranje
const bcrypt = require('bcrypt');
//lokalna autentifikacija pomocu korisnickog i lozinke, nacin/strategija na koji ce se vrsiti autenif
const LocalStrategy = require('passport-local').Strategy;
//glavni modul/bibl za autentifikaciju
const passport = require('passport');

//initialize Passport autentifikacije
//Ova funkcija prima passport kao argument, što omogucuje integraciju s Passport bibliotekom
async function initialize(passport) {
    const authenticateUser = (korisnicko_ime, lozinka, done) => {
        try {
            pool.query(
                `SELECT * FROM korisnici WHERE korisnicko_ime=?`, [korisnicko_ime],
                (err, results) => {
                    if (err) {
                        throw err;
                    }

                    if (results.length > 0) {
                        const korisnik = results[0];

                        // bcrypt fja koja uspoređuje lozinke
                        const isMatch = bcrypt.compareSync(lozinka, korisnik.lozinka);

                        if (isMatch) {
                            // poziva done da obavijesti passport da je autentifikacija prošla
                            // null - nema error, objekt/info korisnika
                            return done(null, korisnik);
                        } else {
                            // null - nema err, false - nije prošla, message - poruka
                            return done(null, false, { message: "Lozinka nije ispravna!" });
                        }
                    } else {
                        // nije pronađen korisnik s tim korisničkim imenom
                        return done(null, false, { message: "Korisničko ime nije registrirano" });
                    }
                }
            );
        } catch (err) {
            console.error('Greška prilikom izvršavanja SQL upita', err);
            return done(err);
        }
    };


    //definiranje nacina autentif (localStrategy)
    //poziv fje authenUser je zaduzena za provjeru korisnika
    passport.use(new LocalStrategy({
        usernameField: "korisnicko_ime",
        passwordField: "lozinka"
    }, authenticateUser));

    //serialize-sprema podatke o korisniku (id) u sesiju nakon sto prvi put uspjesno prodje autentif
    passport.serializeUser((korisnik, done) => done(null, korisnik.id_korisnik));
    //deserialize-obrnuto, dohvaca podatke iz sesije (id) kako bi dohvatio sve potrebne podatke o korisniku
    passport.deserializeUser(async (id_korisnik, done) => {
        try {
            const [results, fields] = await pool.promise().query(
                `SELECT * FROM korisnici WHERE id_korisnik=?`, [id_korisnik]
            );

            return done(null, results[0]);
        }
        catch (err) {
            console.error('Greška prilikom izvršavanja SQL upita', err);
            return done(err);
        }
    });
}
module.exports = initialize;

