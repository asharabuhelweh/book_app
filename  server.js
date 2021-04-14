'use strict';
// Application Dependencies

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Application Setups
const PORT = process.env.PORT || 3030;
const server = express();
server.set('view engine','ejs');
server.use(express.static('./public'));
server.use(express.urlencoded({extended:true}));

// Database Setup
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false },
});
//Routs
server.get('/',homeRoutHandler);
server.post('/search',searchRoutHandler);
server.get('/searches/new',formHandler);
server.post('/books',formHiddenHandler);


function homeRoutHandler(req,res){
  let SQL = `SELECT * FROM books;`;
  client.query(SQL)
  .then (results=>{
    console.log(results);
    res.render('pages/index',{booksArr:results.rows})
  })
  .catch(error=>{
    res.render('pages/searches/error',{errors:error})
  })
}

server.get('/details/:bookID',(req,res) => {
  let sql = 'select * from books where id=$1';
  let safeValues = [req.params.bookID];
  client.query(sql,safeValues)
    .then(results => {
      res.render('pages/books/detail',{bookdetail:results.rows});
    });
});




function searchRoutHandler (req, res) {
  let query = req.body.query;
  let searchOption = req.body.searchOption;
  let keyword = 'intitle';
  if (searchOption == 'author') {
    keyword = 'inauthor';
  }
  let url = 'https://www.googleapis.com/books/v1/volumes?q=' + keyword + ':' + query;
  superagent.get(url)
      .then(result => {
          let books = result.body.items.map(book => new Book(book));
          res.render('pages/searches/show', { books: books });
      })

      .catch(error => {
        res.render('pages/searches/error', { errors: error });
      })
}


function formHandler(req,res){
res.render('pages/searches/new');
}
function formHiddenHandler(req,res){
  res.send('580');
  }

function errorHandler(req,res){
  res.render('pages/searches/404page');

}

// function Book(bookData) {
//   this.title = (bookData.volumeInfo.title)?bookData.volumeInfo.title :'No title';
//   this.author = (bookData.volumeInfo.authors)? bookData.volumeInfo.authors.join(' , ') : 'Author Not Available';
//   this.description = bookData.volumeInfo.description ||'Description Not Available';
//   this.image = (bookData.volumeInfo.imageLinks)? bookData.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';

// }

function Book (data) {
  this.title = data.volumeInfo.title;
  this.image_url = (data.volumeInfo.imageLinks) ? data.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg' ;
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'No descroption for this book' ;
  this.author = data.volumeInfo.authors;
}










server.get('*',errorHandler);


client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  })