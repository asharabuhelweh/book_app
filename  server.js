'use strict';
// Application Dependencies

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');

// Application Setups
const PORT = process.env.PORT || 3030;
const server = express();
server.set('view engine','ejs');
server.use(express.static('./public'));
server.use(express.urlencoded({extended:true}));
//Routs
server.get('/',homeRoutHandler);
server.post('/search',searchRoutHandler);
server.get('/searches/new',formHandler);
server.get('*',errorHandler);



function homeRoutHandler(req,res){
  res.render('pages/index');
}

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
        console.error(error);
        res.render('pages/searches/error', { errors: error });
      })
}


function formHandler(req,res){
res.render('pages/searches/new');
}

function errorHandler(req,res){
  res.render('pages/searches/404page');

}

function Book(bookData) {
  this.title = (bookData.volumeInfo.title)?bookData.volumeInfo.title :'No title';
  this.author = (bookData.volumeInfo.authors)? bookData.volumeInfo.authors.join(' , ') : 'Author Not Available';
  this.description = bookData.volumeInfo.description ||'Description Not Available';
  this.image = (bookData.volumeInfo.imageLinks)? bookData.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';

}














server.listen(PORT,()=>{
  console.log(`Listening on PORT ${PORT}`)
})