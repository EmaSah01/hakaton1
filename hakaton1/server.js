const adminRoutes = require('./routes/adminPanel');
const userPanelRouter = require('./routes/userPanel');
const express = require('express');
const path = require('path');
const app = express();
const bcrypt = require('bcrypt');
const connection = require('./dbConfig.js');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const initializePassport = require('./passportConfig.js');
const controllers = require('./controllersServer'); // Dodali smo controllers

initializePassport(passport);

const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use('/adminPanel', adminRoutes);
app.use('/userPanel', userPanelRouter);

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

connection.connect((err) => {
    if (err) {
        console.error('Greška prilikom povezivanja s bazom podataka', err);
        throw err;
    }
    console.log('Uspješno povezivanje na MySQL bazu');
});

app.get('/', controllers.showLogin);

app.get('/register', controllers.showRegister);

app.get('/login', controllers.showLogin);

app.get('/logout', controllers.logout);

app.get('/adminPanel', controllers.showAdminPanel);

app.get('/userPanel', controllers.showUserPanel);

app.post('/register', controllers.registerUser);

app.post('/login', controllers.loginUser, (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.uloga === 'admin') {
            return res.redirect('/adminPanel');
        } else {
            return res.redirect('/userPanel');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

