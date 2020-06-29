const sqlite3 = require('sqlite3')


const quiz_DATABASE = 'database.db'

interface question_t{
    text : string,
    answer : number,
    time_penalty : number
}

interface quiz_t{
    name : string,
    description : string,
    questions : question_t[]
}

const sqlite = sqlite3.verbose()



const dropTables = ():Promise<void> => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE)
        db.run(`DROP TABLE IF EXISTS quizzes`)
        db.run(`DROP TABLE IF EXISTS users`)
        db.run(`DROP TABLE IF EXISTS questions`)
        db.run(`DROP TABLE IF EXISTS answers`)
        db.run(`DROP TABLE IF EXISTS results`)
        db.close((err: Error) => {
            if (err)
                reject(err)
            resolve()
        })
    })
    
}

const createTables = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE)
        
        db.run(`
            CREATE TABLE quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL,
                description VARCHAR
            )
        `)
        
        db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                login VARCHAR NOT NULL,
                password VARCHAR NOT NULL
            )        
        `)
        
        db.run(`
            CREATE TABLE questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id INTEGER,
                text VARCHAR NOT NULL,
                answer INTEGER NOT NULL,
                time_penalty INTEGER NOT NULL,

                FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
            )
        `)
        
        db.run(`
            CREATE TABLE answers (
                user_id INTEGER NOT NULL,
                question_id INTEGER NOT NULL,
                
                time FLOAT(3) NOT NULL,
                answer INTEGER NOT NULL,

                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(question_id) REFERENCES questions(id),

                UNIQUE(user_id, question_id)
            )
        `)

        db.run(`
            CREATE TABLE results (
                
                user_id INTEGER,
                quiz_id INTEGER,
                score FLOAT(3) NOT NULL,
                start_time BIGINT,

                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(quiz_id) REFERENCES quizzes(id),

                UNIQUE (user_id, quiz_id)
            )
        `)

        db.close((err: Error) => {
            if (err)
                reject(err)
            resolve()
        })
    })
}

const addUsers = (): void => {
    let db = new sqlite.Database(quiz_DATABASE)
    db.run(`
        INSERT INTO users (login, password)
        VALUES ('user1', 'user1')
    `)

    db.run(`
        INSERT INTO users (login, password)
        VALUES ('user2', 'user2')
    `)
} 

const addQuizz = (quizz : quiz_t): Promise<void> => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database(quiz_DATABASE)
        let quiz_id = -1
        db.run(`INSERT INTO quizzes (name, description) VALUES ('${quizz.name}', '${quizz.description}')`, function(err){
        if(err) reject()
        quiz_id = this.lastID
        for(let question of quizz.questions) {
            db.run(`INSERT INTO questions (quiz_id, text, answer, time_penalty) 
                    VALUES (${quiz_id},'${question.text}', ${question.answer}, ${question.time_penalty})`)
        }
        resolve()
        // te pytania mogą się dodac później. Najważniejsze, że mamy poprawne id quizu
    })
 })
}

const quiz_easy : quiz_t = {
    name: "Łatwy",
    description: "Liczyć każdy może...",
    questions: [
        {
            text: "2 + 3",
            answer: 5,
            time_penalty: 4
        },
        {
            text: "7 * (2 + 3)",
            answer: 35,
            time_penalty: 4
        },
        {
            text: "(2 + 4) : 2 + 1",
            answer: 4,
            time_penalty: 5
        },
        {
            text: "(10 - 4) * 3 - 2",
            answer: 16,
            time_penalty: 5
        },
        {
            text: "(12 / 4) * (12 / 3)",
            answer: 12,
            time_penalty: 6
        },
        {
            text: "2 * 5 - 1",
            answer: 9,
            time_penalty: 6
        },
        {
            text: "(10 - 2) / 4 + 1",
            answer: 3,
            time_penalty: 7
        },
        {
            text: "(15 - 3) : 4 + 1",
            answer: 4,
            time_penalty: 7
        },
        {
            text: "7 + 3 + 1 * 4",
            answer: 14,
            time_penalty: 8
        },
        {
            text: "3 * 7 - 12",
            answer: 9,
            time_penalty: 8
        },
    ]
}

const quiz_medium : quiz_t = {
    name: "Średni",
    description: "Spytacie jak trudny jest ten quiz. Nie jest trudny.\nCo prawda nie jest też łatwy, można powiedzieć że jest średni.",
    questions: [
        {
            text: "8 * 7",
            answer: 56,
            time_penalty: 4
        },
        {
            text: "7 * (8 + 3) - 8",
            answer: 69,
            time_penalty: 5
        },
        {
            text: "(12 * 4) / 8 + 1",
            answer: 7,
            time_penalty: 6
        },
        {
            text: "((2 ^ 10) - 24) / 10 - 1",
            answer: 99,
            time_penalty: 7
        },
        {
            text: "(7 * 8) - (6 * 7)",
            answer: 21,
            time_penalty: 8
        },
        {
            text: "(3 ^ 3) - (2 ^ 2) + (1 ^ 1)",
            answer: 24,
            time_penalty: 9
        },
        {
            text: "(1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10) / 5",
            answer: 11,
            time_penalty: 10
        }
    ]
}

const quiz_hard : quiz_t = {
    name: "Trudny",
    description: "Ciężkie zadania, na ciężkie czasy",
    questions: [
        {
            text: "(2!)/(1!) + (3!)/(2!) + ... + (10!)/(9!)",
            answer: 54,
            time_penalty: 10
        },
        {
            text: "(99 - 1) * (98 - 2) * (97 - 3) * ... * (1 - 99)",
            answer: 0,
            time_penalty: 11
        },
        {
            text: "(1 + 2 + 3 + ... + 100)",
            answer: 5050,
            time_penalty: 12
        },
        {
            text: "43 * (1/(1 * 2) + 1/(2 * 3) + ... + 1/(42 * 43))",
            answer: 42,
            time_penalty: 13
        },
        {
            text: "(1 + 3 + 5 + ... + 49) - (5^4)",
            answer: 0,
            time_penalty: 14
        },
    ]
}

const printDB = () => {
    let db = new sqlite.Database(quiz_DATABASE)
    db.all(`SELECT * FROM questions`, (err, rows) => {
        console.log("ROWS: ", rows, err)
    })
    db.all(`SELECT * FROM quizzes`, (err, rows) => {
        console.log("ROWS: ", rows, err)
    })
    db.all(`SELECT name, description, COUNT(*) as no_questions FROM questions LEFT JOIN quizzes ON quizzes.id = questions.quiz_id GROUP BY quiz_id`, (err, rows) => {
        console.log("ROWS: ", rows, err)
    })

}

const createdb = async () => {
    dropTables().then(() => {
        createTables().then(async () => {
            addUsers()
            await addQuizz(quiz_easy)
            await addQuizz(quiz_medium)
            await addQuizz(quiz_hard)
        }).catch(
            (reason) => {
                throw (reason)
            }
        )
    })
}
createdb();
