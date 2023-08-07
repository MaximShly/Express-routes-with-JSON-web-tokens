const express = require('express');
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');
const app = express();

const accessTokenSecret = 'somerandomaccesstoken';

app.use(bodyParser.json());

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(`Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Body: ${JSON.stringify(req.body)}`);
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

let books = [
    {
        "author": "Chinua Achebe",
        "country": "Nigeria",
        "language": "English",
        "pages": 209,
        "title": "Things Fall Apart",
        "year": 1958
    },
    {
        "author": "Hans Christian Andersen",
        "country": "Denmark",
        "language": "Danish",
        "pages": 784,
        "title": "Fairy tales",
        "year": 1836
    },
    {
        "author": "Dante Alighieri",
        "country": "Italy",
        "language": "Italian",
        "pages": 928,
        "title": "The Divine Comedy",
        "year": 1315
    },
]
app.get('/', (req, res) => {
    res.send('You need to authenticate in order to access functionality of this book server.');
});


app.get('/books', authenticateJWT, (req, res) => {
    res.json(books);
});

app.post('/books', authenticateJWT, (req, res) => {
    const { role } = req.user;

    if (role !== 'admin') {
        return res.sendStatus(403);
    }


    const book = req.body;
    books.push(book);

    res.send('book added successfully');
});

app.post('/books/remove', authenticateJWT, (req, res) => {
    const { role } = req.user;

    // Only allow admins to remove books
    if (role !== 'admin') {
        return res.sendStatus(403);
    }

    // Get the title of the book to be removed from the request body
    const { title } = req.body;

    // Find the index of the book in the books array
    const index = books.findIndex(book => book.title === title);

    // If the book was not found, return a 404 status
    if (index === -1) {
        return res.status(404).send('book not found');
    }

    // Remove the book from the books array
    books.splice(index, 1);

    // Send a success response
    res.send(`book with name: ${title} removed successfully`);
});

app.listen(4000, () => {
    console.log('Books service started on port 4000');
});
