import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectSocket } from './socket/socket';
import { config } from 'dotenv';
import path from 'path';
config();
(async () => {
    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname)));
    app.get('/api/config', (req, res) => {
        res.json({
            SERVER_URL: process.env.PATH
        });
    });

    app.get('/', (req, res) => {
        res.render('index');
    });

    app.get('/broadcast', (req, res) => {
        res.render('broadcast'); 
    });

    app.get('/viewer', (req, res) => {
        res.render('viewer');
    });

    const server = http.createServer(app);
    server.listen(process.env.PORT, () => {
        console.log(`Server is listening on port ${process.env.PORT}`);
    })
    connectSocket(server);
})();


