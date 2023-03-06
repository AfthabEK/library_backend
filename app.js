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
      `SELECT * FROM ebooks_publisher`,
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