const express = require('express');
const env = require('dotenv');
env.config();

const CategoryRouter = require('./routes/category.routes');
const PostRoutes = require('./routes/post.routes');
const UserRoutes = require('./routes/user.routes');
const TagRoutes = require('./routes/tag.routes');
// const CommentRoutes = require('./routes/comment.routes');
const AuthRoutes = require('./auth/auth.routes');
const ImageRouter = require('./routes/image.routes');


const cors = require('cors');
// cors({ credentials: true, origin: true });
const ConnectDB = require('./database');
const session = require('express-session');


const crypto = require('crypto');
const { mongo, default: mongoose } = require('mongoose');
const app = express();


var allowedOrigins = ['http://localhost:3000', 'https://siddhi-blog.vercel.app'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.options('https://siddhi-blog.vercel.app', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header("Access-Control-Allow-Headers", "accept, content-type");
    res.header("Access-Control-Max-Age", "1728000");
    return res.sendStatus(200);
});



// app.use(session({
//     genid: function(req) {
//         return genuuid() // use UUIDs for session IDs
//       },
//     secret: crypto.randomBytes(20).toString("hex"),
//     resave: false,
//     saveUninitialized: true,
//     cookie: {  }
// }));

function genuuid() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const sess = {
    genid: function (req) {
        return genuuid() // use UUIDs for session IDs
    },
    secret: crypto.randomBytes(20).toString("hex"),
    cookie: {
        maxAge: 60000,
    },
    resave: false,
    saveUninitialized: true,
    // store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
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
// app.use('/api/v1/blog/comments', CommentRoutes());
app.use('/api/v1/blog/images', ImageRouter);



// app.options('https://siddhi-blog.vercel.app/', function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', "*");
//     res.header('Access-Control-Allow-Methods', 'POST');
//     res.header('Access-Control-Allow-Methods', 'GET');
//     res.header("Access-Control-Allow-Headers", "accept, content-type");
//     res.header("Access-Control-Max-Age", "1728000");
//     return res.sendStatus(200);
// });



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log("http://localhost:" + port);
    ConnectDB()
})






