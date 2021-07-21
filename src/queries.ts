const Pool = require('pg').Pool;
const pool = new Pool({
    user: '',
    host: 'localhost',
    database: '',
    password: '',
    port: 5432,
});
const utils = require('./util');

const getTasks = (request, response) => {
    const sort_field = request.query.sort_field || 'id';
    const sort_direction = request.query.sort_direction || 'ASC';
    const page = request.query.page - 1 || 0;

    pool.query(`SELECT * FROM tasks ORDER BY ${sort_field} ${sort_direction} LIMIT 3 OFFSET ${3 * page}`, (error, result) => {
        if (error) {
            throw error;
        }
        pool.query('SELECT COUNT(*) FROM tasks', (errorCount, resultCount) => {
            if (errorCount) {
                throw errorCount;
            }
            response.status(200).json({
                status: "ok",
                message: {
                    "tasks": result.rows,
                    "total_task_count": +resultCount.rows[0].count
                }
            });
        })
    })
}

const createTask = (request, response) => {
    const {username, email, text} = request.body

    pool.query('INSERT INTO tasks (username, email, text) VALUES ($1, $2, $3) RETURNING *', [username, email, text], (error, result) => {
        if (error) {
            throw error;
        }

        response.status(200).send({
            status: "ok",
            message: result.rows[0]
        });
    })
}

const updateTask = (request, response) => {
    const id = parseInt(request.params.id)
    const {text, status, token} = request.body

    pool.query("SELECT * FROM users WHERE token = $1 AND expired_at < NOW() + INTERVAL '1 day'", [token], (error, result) => {
        if (error) {
            throw error;
        }

        if (result.rows[0] && result.rows[0].token) {
            const fieldsForUpdate = `${text ? `"text"='${text}'` : ' '}${text && utils.isAny(status) ? ', ' : ' '}${utils.isAny(status) ? `"status"=${status}` : ' '}`;
            pool.query(`UPDATE tasks SET ${fieldsForUpdate} WHERE id = $1`, [id], (error) => {
                if (error) {
                    throw error;
                }

                response.status(200).send({
                    status: "ok"
                });
            })
        }

        if (!result.rows[0]) {
            response.status(200).send({
                status: "error",
                message: {
                    token: "Токен истёк"
                }
            });
        }
    })
}

const isAuthorized = (request, response) => {
    const {username, password} = request.body

    pool.query("SELECT * FROM users WHERE username = $1 AND password = $2 AND expired_at < NOW() + INTERVAL '1 day'", [username, password], (error, result) => {
        if (error) {
            throw error;
        }

        if (result.rows[0] && result.rows[0].token) {
            response.status(200).send({
                status: "ok",
                token: result.rows[0].token
            });
        } else {
            response.status(200).send({
                status: "ok",
                token: null
            });
        }
    })
}

const login = (request, response) => {
    const {username, password} = request.body

    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], (error, result) => {
        if (error) {
            throw error;
        }

        if (!result.rows[0]) {
            pool.query("INSERT INTO users (username, password, expired_at, token) VALUES ($1, $2, NOW() + INTERVAL '1 day', $3) RETURNING *", [username, password, utils.uuidv4()], (error, insertResult) => {
                if (error) {
                    throw error;
                }

                response.status(200).send({
                    status: "ok",
                    token: insertResult.rows[0].token
                });
            })
        }

        if (result.rows[0] && result.rows[0].token) {
            response.status(200).send({
                status: "ok",
                token: result.rows[0].token
            });
        }

        if (result.rows[0] && !result.rows[0].token) {
            pool.query("UPDATE users SET expired_at = NOW() + INTERVAL '1 day', token = $1 WHERE username = $2 AND password = $3 RETURNING *", [utils.uuidv4(), username, password], (error, updateResult) => {
                if (error) {
                    throw error;
                }

                response.status(200).send({
                    status: "ok",
                    token: updateResult.rows[0].token
                });
            })
        }
    })
}

const unlogin = (request, response) => {
    const {token} = request.body

    pool.query('UPDATE users SET expired_at = NULL, token = NULL WHERE token = $1', [token], (error) => {
        if (error) {
            throw error;
        }

        response.status(200).send({
            status: "ok",
            token: null
        });
    })
}

module.exports = {
    getTasks,
    createTask,
    updateTask,
    isAuthorized,
    login,
    unlogin
}