const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const path = require("path");
const mysql = require("mysql");
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "library2",
  multipleStatements: "true", //this is required for querying multiple statements in mysql
  port:8111,
});

app.get("/", async(req,res) => {
      pool.getConnection(function (err, connection) {
        connection.query(
          `SELECT * FROM announcements;`,
          async (err, data) => {
            connection.release();
            if (err) console.log(err);
            else res.json({ data });
          }
        );
      });
})
app.get('/ebooks/:id' , async(req,res)=> {
  const { id } = req.params;
    pool.getConnection(function(err , connection) {
        connection.query(
            `SELECT * FROM ebooks where publisher_id=${id};`, 
            async (err, data) => {
            connection.release();
            if (err) console.log(err);
            else
                res.json({ data });
            }
        )
    })
})

app.get("/ebooks", async (req, res) => {
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM ebooks_publisher where link=""; SELECT * FROM ebooks_publisher where link <> ""`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data:data[0], links:data[1] });
      }
    );
  });
});

app.get("/pjournals", async (req, res) => {
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM p_journals;`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data });
      }
    );
  });
});

app.get("/dailies", async (req, res) => {
  pool.getConnection(function (err, connection) {
    connection.query(`SELECT * FROM dailies_and_mags;`, async (err, data) => {
      connection.release();
      if (err) console.log(err);
      else res.json({ data });
    });
  });
});

app.get("/ojournals", async (req, res) => {
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM online_journals_publisher where type = "eshodh" and link=""; SELECT * FROM online_journals_publisher where type = "subscribed" and link=""; SELECT * FROM online_journals_publisher where type = "eshodh" and link <> ""; SELECT * FROM online_journals_publisher where type = "subscribed" and link <> ""; `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else
          res.json({
            eshodh: data[0],
            sub: data[1],
            elinks: data[2],
            slinks: data[3],
          });
      }
    );
  });
});

app.get("/ojournals/:id", async (req, res) => {
  const { id } = req.params;
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT * FROM online_journals where publisher_id=${id};`,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else res.json({ data });
      }
    );
  });
});

app.get("/publishers",async (req,res)=>{
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT name FROM ebooks_publisher `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else {
          res.json({ data });
        }
      }
    );
  });
})

app.post("/new-ebook",async(req,res)=>{
  console.log(req.body);
  const {title,link,publisher,author}=req.body;
  pool.getConnection(function (err, connection) {
    connection.query(
      `SELECT publisher_id FROM ebooks_publisher WHERE name='${publisher}' `,
      async (err, data) => {
        connection.release();
        if (err) console.log(err);
        else {
          console.log(data);
          pool.getConnection(function (err2, connection2) {
            connection2.query(
              `INSERT INTO ebooks(publisher,author,title,link,year,publisher_id) VALUES('${publisher}','${author}','${title}','${link}',2023,${data[0].publisher_id}) `,
              async (err2, data2) => {
                connection2.release();
                if (err2) console.log(err2);
              }
            );
          })
        }
      }
    );
  })
})

app.post("/multiple-new-ebook",async(req,res)=>{
  console.log(req.body);
  const {ebooks,publishers}=req.body;
  const allPublishersPresent =await ebooks.every(({Publisher}) => publishers.some(({name}) => name === Publisher));
  if(allPublishersPresent===true){
    ebooks.forEach((ebook)=>{
      const {Title,Link,Publisher,Author}=ebook;
      pool.getConnection(function (err, connection) {
        connection.query(
          `SELECT publisher_id FROM ebooks_publisher WHERE name='${Publisher}' `,
          async (err, data) => {
            connection.release();
            if (err) console.log(err);
            else {
              console.log(data);
              pool.getConnection(function (err2, connection2) {
                connection2.query(
                  `INSERT INTO ebooks(publisher,author,title,link,year,publisher_id) VALUES('${Publisher}','${Author}','${Title}','${Link}',2023,${data[0].publisher_id}) `,
                  async (err2, data2) => {
                    connection2.release();
                    if (err2) console.log(err2);
                  }
                );
              })
            }
          }
        );
      })
    })
    const responseData = { message: 'The request was successful.',color:'success' };
  
    // Send the response data back to the client
    res.send(responseData);
  }
  else{
    const responseData = { message: 'Some of the publishers where not present in the database',color:'danger' };
  
  // Send the response data back to the client
    res.send(responseData);
  }

})

app.listen(7000, () => {
  console.log("LISTENING ON PORT 7000!");
});