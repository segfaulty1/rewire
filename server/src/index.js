const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fsSync = require('fs');

require('dotenv').config();
const PORT = process.env.PORT || 2000;

const url = require('url');
const vars = require('./vars.js');

app.use((req, res, next)=>{
  if(vars.serverAddress){next();}
  const fullAddress = url.format({
    protocol: req.protocol,
    host: req.headers.host
  });
  // console.log(fullAddress);
  vars.serverAddress = fullAddress;
});

app.use(helmet());
app.use(
  cors({
    origin: [vars.clientAddress],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

app.use('/', require('./router'));

app.use('*', (req, res) => {
  return res.status(404).json({ data: 'nothing to see here' });
});

app.use((err, req, res, next) => {
  console.log('================================ error handler route')
  console.log(err)
  // console.error(err.stack);

  // rare case
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ err: 'something went bad in the server' });
});


// fire up
if(process.env.PRODUCTION){
  https.createServer(
    {cert: fsSync.readFileSync(process.env.SSL_CERT), key:fsSync.readFileSync(process.env.SSL_KEY)},
    app).listen(PORT, "0.0.0.0", () => {
      console.log(`listening on port: ${PORT} from index.js`);
    }
  );
}else{
  app.listen(PORT, "0.0.0.0", () => {
      console.log(`listening on port: ${PORT} from index.js`);
  });
}
