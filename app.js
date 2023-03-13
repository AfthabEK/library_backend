const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql");
const cors = require("cors");
app.use(cors());

var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "library",
  multipleStatements: "true", //this is required for querying multiple statements in mysql
});

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

app.listen(7000, () => {
  console.log("LISTENING ON PORT 7000!");
});