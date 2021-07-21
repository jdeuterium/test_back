const hasQueryDeveloper = (request, response) => {
    if (!request.query.developer) {
        response.status(400).json({
            "status": "error",
            "message": "Не передано имя разработчика"
        });
        throw new Error("Не передано имя разработчика");
    }
}

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({
        "status": "error",
        "message": "Something failed!"
    });
}

const isAny = (value) => value !== null && value !== undefined;

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = {
    hasQueryDeveloper,
    errorHandler,
    isAny,
    uuidv4
};