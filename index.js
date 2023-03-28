const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "goodreads.db");
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const sqlQuery = `
        select * from book where book_id = ${bookId}
    `;
  const dbResponse = await db.get(sqlQuery);
  response.send(dbResponse);
});

//Post Book API
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const requestQuery = `
        insert into 
            book(title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
        values ('${title}' , ${authorId} , ${rating} , ${reviewCount} , ${ratingCount} , '${description}' , ${pages} , '${dateOfPublication}' , '${editionLanguage}' , ${price} ,'${onlineStores}')
    `;
  const dbResponse = await db.run(requestQuery);
  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});

app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const requestQuery = `
        update 
            book
        set 
            title='${title}',
            author_id=${authorId},
            rating=${rating},
            rating_count=${ratingCount},
            review_count=${reviewCount},
            description='${description}',
            pages=${pages},
            date_of_publication='${dateOfPublication}',
            edition_language='${editionLanguage}',
            price= ${price},
            online_stores='${onlineStores}'
        where book_id = ${bookId}
    `;
  const dbResponse = await db.run(requestQuery);
  response.send("update is success full");
});
