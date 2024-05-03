"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const jwtpasscode = "9874615801";
const emailSchema = zod_1.z.string().email();
const passwordSchema = zod_1.z.string().min(8);
function checkUserMiddleware(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var check = emailSchema.safeParse(email);
    var check1 = passwordSchema.safeParse(password);
    if (!(check.success && check1.success)) {
        res.status(403).send("Invalid format of creddentials");
    }
    else {
        next();
    }
}
app.use(express_1.default.json());
//signup route
app.post("/signup", checkUserMiddleware, (req, res) => {
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;
    function dbentry(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield prisma.users.create({
                    data: user,
                });
                res.status(202).send(result);
            }
            catch (err) {
                res.status(404).send("Somethings up");
            }
        });
    }
    dbentry({
        name,
        email,
        password
    });
});
//login route
app.post("/signin", checkUserMiddleware, (req, res) => {
    var email = req.headers.email;
    try {
        var token = jsonwebtoken_1.default.sign({
            email,
        }, jwtpasscode);
        res.status(200).send(token);
    }
    catch (err) {
        res.status(404).send("somethings up");
    }
});
function tokenMiddleware(req, res, next) {
    var token = req.body.token;
    var email = req.body.email;
    var verify = jsonwebtoken_1.default.verify(token, jwtpasscode, (err) => {
        if (!err) {
            next();
        }
        else {
            res.status(401).send("wrong credentials");
        }
    });
}
//putting todos
app.post("/todos", tokenMiddleware, (req, res) => {
    var user_id = req.body.userid;
    var title = req.body.title;
    var description = req.body.description;
    function dbentry(todo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield prisma.todos.create({
                    data: todo
                });
                res.status(202).send(JSON.stringify(result));
            }
            catch (err) {
                res.status(401).send(err);
            }
        });
    }
    dbentry({
        user_id,
        title,
        description
    });
});
//updating todos
app.post("/update", tokenMiddleware, (req, res) => {
    var id = req.body.todoid;
    function dbentry(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield prisma.todos.update({
                    where: { id },
                    data: { done: true }
                });
                res.status(202).send(JSON.stringify(result));
            }
            catch (err) {
                res.status(401).send(err);
            }
        });
    }
    dbentry(id);
});
//fetch todos
app.get("/getall", tokenMiddleware, (req, res) => {
    var user_id = req.body.userid;
    function fetchdb(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var result = yield prisma.todos.findFirst({
                    where: { user_id }
                });
                res.status(202).send(JSON.stringify(result));
            }
            catch (err) {
                res.status(401).send("error in fetching");
            }
        });
    }
    fetchdb(user_id);
});
app.listen(3000);
