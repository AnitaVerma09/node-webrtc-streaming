import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectSocket } from './src/socket/socket';
import { config } from 'dotenv';
import path from 'path';
config();

(async () => {
    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.set('view engine', 'ejs');
    app.use(express.static('views'));
    // app.use(express.static('public'));
    app.use(express.static(path.join(__dirname, 'public')));

    // Set the views directory
    app.set('views', path.join(__dirname, './src/views'));

    // Your route handlers go here
    app.get('/', (req, res) => {
        res.render('index'); // This should match your view file
    });

    

    const server = http.createServer(app);
    server.listen(3000, () => {
        console.log(`Server is listening on port ${3000}`);
    })
    connectSocket(server);
})();


