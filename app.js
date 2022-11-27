const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { BasicAuthenticator } = require('ibm-cloud-sdk-core');
const Readable = require('stream').Readable;  
const fs = require('fs');
const formidable = require('formidable');
const { uuid } = require('uuidv4');
require('dotenv').config();

let express = require('express'),
    path = require('path');
const { randomInt } = require('crypto');

let app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use('/', express.static(path.join(__dirname, '/views')));

let service;

function initDB() {
  const authenticator = new BasicAuthenticator({
      username: process.env.username,
      password: process.env.password
  });

    service = new CloudantV1({
    authenticator: authenticator
});

service.setServiceUrl(process.env.url);

}
app.get("/allDocs",(req,res)=>{
  service.postAllDocs({
    db: 'products',
    includeDocs: true,
    limit: 25
  }).then(response => {
    res.send(JSON.stringify(response.result.rows));
  });  
})

app.get("/getdoc/:attachmentName/:docId",(req,res)=>{
  service.getAttachment({
    db: 'products',
    docId: req.params.docId,
    attachmentName: req.params.attachmentName
  }).then(response => {
    res.set('Content-disposition', `attachment; filename*=${req.params.attachmentName}`); // set a filename for your response f.e. data.json
    response.result.pipe(res);
  });
})

app.post("/delete/:attachmentName/:docId",(req,res)=>{
  service.getDocument({
    db: 'products',
    docId: req.params.docId
  }).then(response => {
    service.deleteDocument({
      db: 'products',
      docId: req.params.docId,
      rev: response.result._rev
    }).then(()=>{
      res.send("Delete complete")
    })
    });
})

app.post("/upload",(req,res)=>{

  let form = new formidable.IncomingForm();
  let origname;
  form.parse(req, function (err, fields, files) {
    let fileuploadpath = files.fileupload.filepath;
    
    origname = files.fileupload.originalFilename;
    const readableStream = fs.createReadStream(fileuploadpath);
    const stream = new Readable();
    readableStream.on('readable', () => {
      while (null !== (chunk = readableStream.read())) {
        stream.push(chunk);
      }
    });
  
    readableStream.on('end', () => {
    stream.push(null);
    service.putAttachment({
      db: 'products',
      docId: uuid()+":"+randomInt(100),
      attachmentName: origname,
      attachment: stream,
      contentType: files.fileupload.mimetype,
    }).then(response => {
        res.redirect('/');
      });
    });
  });
})

app.listen('8080',()=>{
    initDB();
    console.log("Listening on 8080");
  })