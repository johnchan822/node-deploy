const { default: axios } = require("axios");
const cheerio = require("cheerio");
const QS = require("qs");
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/test", (req, res) => {
  res.json({
    message: "test work!!",
  });
});

app.post("/getBooks", async (req, res) => {
  try {
    let ISBN = req.body.ISBN;
    let data = await getBookData(ISBN);
    if (ISBN.length == 13) {
      if (data) {
        res.json({
          bookName: data.bookName,
          author: data.author,
          publish: data.publish,
          ISBN: ISBN,
        });
      } else {
        res.json({
          message: "Error",
        });
      }
    }
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

const getBookData = async (ISBN) => {
  let bookName = "";
  let author = "";
  let publish = "";
  const data = QS.stringify({
    FO_SearchField0: "ISBN",
    FO_SearchValue0: ISBN,
    FB_clicked: "FB_開始查詢",
    FB_pageSID: "Simple",
    FO_Match: "2",
    FO_資料排序: "PubMonth_Pre DESC",
    FO_每頁筆數: "10",
    FO_目前頁數: "1",
    FB_ListOri: "",
  });
  let body = await axios.post(
    "https://isbn.ncl.edu.tw/NEW_ISBNNet/H30_SearchBooks.php?Pact=DisplayAll4Simple",
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie:
          "cookiesession1=678B2872F15FE312E139A4097FDF8744; _ga=GA1.3.1378075679.1655392490; _ga_GCY2FTVQKG=GS1.1.1663825810.5.0.1663825811.0.0.0; PHPSESSID=9sp93klrha3pd0u21l5btflor2; _gid=GA1.3.2071258111.1663951041; _gat=1",
      },
    }
  );

  const $ = cheerio.load(body.data);

  $(".table-searchbooks").each((index, element) => {
    bookName = $(element).find("td[aria-label='書名']").text();

    author = $(element).find("td[aria-label='作者']").text();
    publish = $(element).find("td[aria-label='出版者']").text();
  });

  return {
    bookName,
    author,
    publish,
  };
};

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Express Server started on port ${port}`);
});
