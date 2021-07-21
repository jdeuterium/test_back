const express = require('express');
const router = express.Router({strict: true});
const db = require('./queries');
const util = require('./util');

router.get('/', (request, response) => {
    util.hasQueryDeveloper(request, response);
    db.getTasks(request, response);
});

router.post('/create/', (request, response) => {
    util.hasQueryDeveloper(request, response);
    const {username, email, text} = request.body;

    if (!username || !email || !text) {
        response.status(200).send({
            status: "error",
            message: {
                username: !username ? "Поле является обязательным для заполнения" : undefined,
                email: !email ? "Неверный email" : undefined,
                text: !text ? "Поле является обязательным для заполнения" : undefined
            }
        });
    } else {
        db.createTask(request, response);
    }
});

router.put('/edit/:id/', (request, response) => {
    util.hasQueryDeveloper(request, response);
    const {text, status} = request.body;

    if (!text.length || (status === null || status === undefined)) {
        response.status(200).send({
            status: "error",
            message: {
                text: !text.length ? "Поле является обязательным для заполнения" : undefined,
                status: status === null || status === undefined ? "Поле является обязательным для заполнения" : undefined
            }
        });
    } else {
        db.updateTask(request, response);
    }
});

router.post('/isAuthorized/', (request, response) => {
    util.hasQueryDeveloper(request, response);
    db.isAuthorized(request, response);
})

router.post('/login/', (request, response) => {
    util.hasQueryDeveloper(request, response);
    const {username, password} = request.body;

    if (!(username || password) || (username !== 'admin' || password !== '123')) {
        response.status(200).send({
            status: "error",
            message: {
                username: !username ? "Поле является обязательным для заполнения" : undefined,
                password: !password || username !== 'admin' || password !== '123' ? "Неверный логин или пароль" : undefined
            }
        });
    } else {
        db.login(request, response);
    }
})

router.post('/unlogin/', (request, response) => {
    util.hasQueryDeveloper(request, response);
    const {token} = request.body;

    if (!token) {
        response.status(200).send({
            status: "error",
            message: {
                token: "Ошибка доступа",
            }
        });
    } else {
        db.unlogin(request, response);
    }
})

module.exports = router;