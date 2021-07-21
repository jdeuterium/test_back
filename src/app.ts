import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const routes = require('./routes');
const utils = require('./util');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
    if (req.url !== req.originalUrl.substring(req.baseUrl.length)) {
        res.redirect(301, `${req.url}/`);
    }
    next();
});
app.use('/~pitaev/test-task-backend/v2/', routes);
app.use(utils.errorHandler);

app.listen(port, () => {
    return console.log('App running.');
});