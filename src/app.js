const express = require('express');
const env = require('dotenv');
env.config();

var fs = require('fs');
// var http = require('http');
var https = require('https');
var path = require('path');
const credentials = {
    key: fs.readFileSync(path.join(__dirname, "../sslcert/server-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../sslcert/server.pem")),
};


console.log(credentials);

const CategoryRouter = require('./routes/category.routes');
const PostRoutes = require('./routes/post.routes');
const UserRoutes = require('./routes/user.routes');
const TagRoutes = require('./routes/tag.routes');
const AuthRoutes = require('./auth/auth.routes');
const ImageRouter = require('./routes/image.routes');

const cors = require('cors');
const ConnectDB = require('./database');
const session = require('express-session');

const crypto = require('crypto');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    // exposedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.options('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "accept, content-type");
    res.header("Access-Control-Max-Age", "1728000");
    return res.sendStatus(200);
});

function genuuid() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const sess = {
    genid: function (req) { return genuuid() },
    secret: crypto.randomBytes(20).toString("hex"),
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true,
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.json({
        message: 'Hello World',
        session: req.session,
        mongo: process.env.MONGO_URI,
        port: process.env.PORT,
        env: process.env.NODE_ENV,
        mongoose: mongoose.connection.readyState
    })
})

app.get('/session', (req, res) => {
    res.send(req.session)
})

app.use('/api/v1/blog/categories', CategoryRouter);
app.use('/api/v1/blog/posts', PostRoutes);
app.use('/api/v1/blog/user', UserRoutes);
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/blog/tags', TagRoutes);
app.use('/api/v1/blog/images', ImageRouter);




// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// httpServer.listen(8080, () => {
//     ConnectDB();
//     console.log("server running at http://IP_ADDRESS:8080/ \n http://localhost:8080 \n Development Mode");
// });

httpsServer.listen(8443, () => {
    ConnectDB();
    console.log("server running at https://IP_ADDRESS:8443/ \n https://localhost:8443 \n Production Mode")
});

