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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3 = __importStar(require("sqlite3"));
const sqlite = sqlite3.verbose();
const { promisify } = require("es6-promisify");
const misc_1 = require("./misc");
const PERCENTS_ERROR_MARGIN = 0.001;
const quiz_DATABASE = 'database.db';
const promisifiedRun = (db, sql) => {
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
const changeQuestion = (quiz, question_number) => {
    if (question_number >= quiz.questions.length || question_number < 0)
        return;
    const current_time = (new Date()).getTime();
    const previous_question = quiz.questions[quiz.current_question];
    previous_question.time += (current_time - quiz.time_of_question_start);
    quiz.time_of_question_start = current_time;
    quiz.current_question = question_number;
};
const saveAnswer = (quiz, answer) => {
    const question_number = quiz.current_question;
    if (question_number >= quiz.questions.length || question_number < 0)
        return;
    if (quiz.questions[question_number].answer === undefined && answer !== undefined)
        quiz.questions_left--;
    if (quiz.questions[question_number].answer !== undefined && answer === undefined)
        quiz.questions_left++;
    quiz.questions[question_number].answer = answer;
};
exports.switchQuestion = (quiz, answer, question_number) => {
    saveAnswer(quiz, answer);
    changeQuestion(quiz, question_number);
    return quiz;
};
const getQuiz = (quiz_id) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE);
        db.get(`SELECT * FROM quizzes WHERE id = '${quiz_id}'`, (err, quiz) => {
            if (err)
                reject(err);
            if (quiz === undefined) {
                resolve(undefined);
            }
            else {
                const user_quiz = {
                    id: quiz.id,
                    user_id: -1,
                    name: quiz.name,
                    description: quiz.description,
                    questions_left: 0,
                    current_question: 0,
                    time_of_question_start: 0,
                    questions: []
                };
                resolve(user_quiz);
            }
        });
    });
};
const getQuestions = (quiz_id) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE);
        db.all(`SELECT * FROM questions WHERE quiz_id = ${quiz_id}`, (err, questions) => {
            if (err)
                reject(err);
            if (questions === []) {
                resolve([]);
            }
            else {
                const user_questions = [];
                for (let question of questions) {
                    const user_question = {
                        id: question.id,
                        text: question.text,
                        answer: undefined,
                        time: 0
                    };
                    user_questions.push(user_question);
                }
                resolve(user_questions);
            }
        });
    });
};
exports.askForQuiz = (quiz_id, user_id) => {
    console.log(user_id, "ASKED FOR QUIZ No", quiz_id);
    return new Promise((resolve, reject) => {
        canUserSolve(quiz_id, user_id)
            .then((canUserSolve) => {
            if (!canUserSolve)
                reject("User has already solved this quiz");
            else {
                getQuestions(quiz_id)
                    .then((questions) => {
                    if (questions === [])
                        reject("EMPTY QUESTIONS");
                    getQuiz(quiz_id)
                        .then((quiz) => {
                        if (quiz === undefined)
                            reject("UNDEFINED QUIZ");
                        else {
                            quiz.questions = questions;
                            quiz.questions_left = questions.length;
                            quiz.user_id = user_id;
                            const current_time = (new Date()).getTime();
                            quiz.time_of_question_start = current_time;
                            console.log(quiz);
                            let db = new sqlite.Database(quiz_DATABASE);
                            console.log("SQL: ", `INSERT INTO results (user_id, quiz_id, score, start_time)
                            VALUES (${user_id}, ${quiz_id}, 0, ${current_time})`);
                            db.run(`INSERT INTO results (user_id, quiz_id, score, start_time)
                                    VALUES (${user_id}, ${quiz_id}, 0, ${current_time})`, (err) => {
                                if (err)
                                    reject(err);
                                else
                                    resolve(quiz);
                            });
                        }
                    });
                });
            }
        })
            .catch((err) => {
            reject(err);
        });
    });
};
const canUserSolve = (quiz_id, user_id) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE);
        db.get(`SELECT * FROM results WHERE quiz_id = ${quiz_id} AND user_id = ${user_id}`, (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res === undefined);
        });
    });
};
const saveResults = (quiz) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE);
        db.get(`SELECT start_time, score FROM results WHERE quiz_id = ${quiz.id} AND user_id = ${quiz.user_id}`, (err, res) => {
            if (err || res === undefined)
                reject("SOLUTION ERROR");
            else {
                if (res.score !== 0) {
                    reject("User already solved this quiz");
                    return;
                }
                const start_time = res.start_time;
                const current_time = (new Date()).getTime();
                const solve_time = (current_time - start_time) / 1000;
                let result = solve_time;
                db.all(`SELECT id, answer, time_penalty FROM questions WHERE quiz_id = ${quiz.id}`, (err, questions) => __awaiter(void 0, void 0, void 0, function* () {
                    if (err || questions == [])
                        reject("QUESTIONS ERROR");
                    let percents = 0;
                    for (let question of quiz.questions) {
                        percents += question.time;
                    }
                    if (Math.abs(percents - 100.0) > PERCENTS_ERROR_MARGIN)
                        reject("PERCENTS WRONG");
                    try {
                        for (let answer of quiz.questions) {
                            for (let question of questions) {
                                if (question.id !== answer.id)
                                    continue;
                                answer.time = answer.time * solve_time / 100;
                                if (question.answer !== answer.answer)
                                    result += question.time_penalty;
                                break;
                            }
                            yield promisifiedRun(db, `INSERT INTO answers (question_id, user_id, time, answer)
                            VALUES (${answer.id}, ${quiz.user_id}, ${answer.time}, ${answer.answer}) `);
                        }
                        yield promisifiedRun(db, `UPDATE results SET score = ${result} WHERE user_id = ${quiz.user_id} AND quiz_id = ${quiz.id}`);
                        resolve(true);
                    }
                    catch (err) {
                        reject(`DB UPDATE ERROR: ${err}`);
                    }
                }));
            }
        });
    });
};
const timeToProcents = (quiz) => {
    let time = 0;
    for (let question of quiz.questions) {
        if (question.time <= 0)
            return false;
        time += question.time;
    }
    time /= 100;
    for (let question of quiz.questions) {
        question.time /= time;
    }
    return true;
};
exports.submitAnswers = (quiz, user_id) => {
    console.log("SUBMIT ANSWERS");
    return new Promise((resolve, reject) => {
        if (quiz.user_id !== user_id) {
            reject("ERR: no permition");
        }
        if (!timeToProcents(quiz))
            reject("ERR: time values not valid");
        saveResults(quiz)
            .then(() => {
            console.log("NO OK O CO CHODIZ KUXWA TU");
            resolve();
        })
            .catch((err) => {
            reject(err);
        });
    });
};
exports.getQuizList = (user_id) => {
    return new Promise((resolve, reject) => {
        let quiz_list = [];
        let db = new sqlite.Database(quiz_DATABASE);
        db.all(`SELECT quizzes.id, name, description, score 
             FROM quizzes LEFT JOIN 
                (SELECT score, quiz_id FROM results WHERE user_id = ${user_id}) 
            ON id = quiz_id`, (err, rows) => {
            if (err)
                reject(err);
            for (let row of rows) {
                const quiz = {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    solved: (row.score !== null)
                };
                console.log("SCORE: ", row.score);
                console.log("QUIZ: ", quiz);
                quiz_list.push(quiz);
            }
            resolve(quiz_list);
        });
    });
};
exports.getResults = (quiz_id, user_id) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE);
        db.get(`SELECT name, description, score 
                FROM quizzes LEFT JOIN results ON quizzes.id = results.quiz_id 
                WHERE user_id = ${user_id} AND quiz_id = ${quiz_id}`, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            if (res === undefined) {
                resolve(undefined);
            }
            else {
                db.all(`SELECT text, questions.answer AS correct_answer, answers.answer AS user_answer, time, time_penalty, avg  
                                FROM answers LEFT JOIN questions ON question_id = questions.id 
                                LEFT JOIN (SELECT question_id AS a_id, AVG(time) as avg FROM answers GROUP BY question_id) ON a_id = question_id
                                WHERE user_id = ${user_id} AND quiz_id = ${quiz_id}`, (err, questions) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (questions === []) {
                        resolve(undefined);
                        return;
                    }
                    else {
                        let results = {
                            name: res.name,
                            description: res.description,
                            score: misc_1.roundToNDecPlaces(res.score, 2),
                            questions: []
                        };
                        for (let question of questions) {
                            results.questions.push({
                                text: question.text,
                                answer: question.user_answer,
                                correct_answer: question.correct_answer,
                                time: misc_1.roundToNDecPlaces(question.time, 2),
                                time_penalty: question.time_penalty,
                                avg_time: misc_1.roundToNDecPlaces(question.avg, 2)
                            });
                        }
                        console.log("RESULTS: ", results);
                        resolve(results);
                    }
                });
            }
        });
    });
};
