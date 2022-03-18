const express = require('express');
const history = require('connect-history-api-fallback');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// redirect to https
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    return next();
  } else {
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Origin', '*');
    return next();
  }
});

// serve SPA and add fallback
app.use(history());
app.use(express.static('dist'));
app.use('*', express.static('dist'));

// initialize
console.log(`Application started ...`);
const port = process.env.PORT || 80;
app.listen(port, async function () {
  console.log(`Listening.`);
});
