const express = require("express");
const app = express();
const mysql = require("mysql");

var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "library",
  multipleStatements: "true", //this is required for querying multiple statements in mysql
});

app.get("/seed", async (req, res) => {
  const response = await fetch("http://127.0.0.1:5000/data");
  const results = await response.json();
  pool.getConnection(function (err, connection) {
    for (let result of results) {
      connection.query(
        `INSERT INTO ebooks(publisher,title,link,author) VALUES("${result.publisher}", "${result.title}", "${result.link}", "${result.author}");`,
        async (err, articles) => {
          if (err) console.log(err);
        }
      );
    }
    connection.release();
  });

  //console.log(data);
  res.send(results);
});

app.listen(7000, () => {
  console.log("LISTENING ON PORT 7000!");
});
