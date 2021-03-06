const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 8080;
const rp = require("request-promise");
const $ = require("cheerio");
const cors = require("cors");
var bodyParser = require("body-parser");

express()
  .use(express.static(path.join(__dirname, "public")))
  .use(cors())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/stockInfo", (req, res) => showTimes(req, res))
  .get("/stockInfo2", (req, res) => showTimes2(req, res))
  .get("/stockInfo3", (req, res) => showTimes3(req, res))
  .get("/stockInfo4", (req, res) => showTimes4(req, res))
  .get("/price", (req, res) => price(req, res))
  .post("/dividendInfo", (req, res) => dividendInfo(req, res))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

showTimes = (req, res) => {
  var ticker = req.query.ticker;
  var exchange =
    req.query.exchange === "USA-NYSE"
      ? "NYSE"
      : req.query.exchange === "USA-NASDAQ"
      ? "NASDAQ"
      : exchange;
  var stock = {};
  var url;

  var ketStatistics = function () {
    var promise = new Promise(function (resolve, reject) {
      url =
        "https://finance.yahoo.com/quote/" +
        ticker +
        "/key-statistics?p=" +
        ticker;
      rp(url)
        .then(function (html) {
          stock.anualDividend = $(
            "td[class='Fw(500) Ta(end) Pstart(10px) Miw(60px)']",
            html
          )
            .eq(18)
            .text();
          stock.payoutRatio = $(
            "td[class='Fw(500) Ta(end) Pstart(10px) Miw(60px)']",
            html
          )
            .eq(23)
            .text();
          stock.exDividendDate = $(
            "td[class='Fw(500) Ta(end) Pstart(10px) Miw(60px)']",
            html
          )
            .eq(25)
            .text();
          stock.dividendDate = $(
            "td[class='Fw(500) Ta(end) Pstart(10px) Miw(60px)']",
            html
          )
            .eq(24)
            .text();
          stock.fiveYearTrailing = $(
            "td[class='Fw(500) Ta(end) Pstart(10px) Miw(60px)']",
            html
          )
            .eq(22)
            .text();
          resolve();
        })
        .catch(function (err) {
          resolve();
        });
    });
    return promise;
  };

  var profile = function () {
    var promise = new Promise(function (resolve, reject) {
      url =
        "https://finance.yahoo.com/quote/" + ticker + "/profile?p=" + ticker;
      rp(url)
        .then(function (html) {
          stock.sector = $("span[class='Fw(600)']", html).eq(0).text();
          resolve();
        })
        .catch(function (err) {
          resolve();
        });
    });
    return promise;
  };

  var profile2 = function () {
    var promise = new Promise(function (resolve, reject) {
      url =
        "https://www.marketbeat.com/stocks/" +
        exchange +
        "/" +
        ticker +
        "/dividend/";
      rp(url)
        .then(function (html) {
          $("td", html).each(function (index, element) {
            var elementText = $(this).text();
            switch (elementText) {
              case "Dividend Growth:":
                stock.dividendGrowth = $("td", html)
                  .eq(index + 1)
                  .text()
                  .split(" ")[0];
                break;
              case "Track Record:":
                stock.trackRecord =
                  $("td", html)
                    .eq(index + 1)
                    .text()
                    .split(" ")[0] + " Years";
                stock.firstDividend =
                  new Date().getFullYear() - parseInt(stock.trackRecord);
                break;
              case "Frequency:":
                stock.frequency = $("td", html)
                  .eq(index + 1)
                  .text()
                  .split(" ")[0];
                break;
            }
          });
          resolve();
        })
        .catch(function (err) {
          console.log(err);
          resolve();
        });
    });
    return promise;
  };

  ketStatistics()
    .then(profile)
    .then(profile2)
    .then(() => {
      res.json({ status: true, stock: stock });
    })
    .catch((e) => {
      console.log(e);
      res.status(400).json({ status: "error" });
    });
};

showTimes2 = (req, res) => {
  var ticker = req.query.ticker;
  var stock = {};
  var url;

  var profile = function () {
    var promise = new Promise(function (resolve, reject) {
      url = "https://www.marketbeat.com/stocks/NASDAQ/" + ticker;
      rp({ url: url, jar: true })
        .then(function (html) {
          $("td", html).each(function (index, element) {
            var elementText = $(this).text();
            switch (elementText) {
              case "Dividend Growth:":
                stock.dividendGrowth = $("td", html)
                  .eq(index + 1)
                  .text()
                  .split(" ")[0];
                break;
              case "Track Record:":
                stock.trackRecord =
                  $("td", html)
                    .eq(index + 1)
                    .text()
                    .split(" ")[0] + " Years";
                break;
              case "Frequency:":
                stock.frequency = $("td", html)
                  .eq(index + 1)
                  .text()
                  .split(" ")[0];
                break;
            }
          });
          resolve();
        })
        .catch(function (err) {
          resolve();
        });
    });
    return promise;
  };

  profile()
    .then(() => {
      res.json({ status: true, stock: stock });
    })
    .catch((e) => {
      console.log(e);
      res.status(400).json({ status: "error" });
    });
};

showTimes3 = (req, res) => {
  var ticker = req.query.ticker;
  var stock = {};
  var url;

  var profile = function () {
    var promise = new Promise(function (resolve, reject) {
      url =
        "https://finance.yahoo.com/quote/" +
        ticker +
        "/key-statistics?p=" +
        ticker;
      rp(url)
        .then(function (html) {
          stock.twoKdaysAvg = $(
            "td[class='Fw(500) Ta(end) Pstart(10px) Miw(60px)']",
            html
          )
            .eq(6)
            .text();
          resolve();
        })
        .catch(function (err) {
          resolve();
        });
    });
    return promise;
  };

  profile()
    .then(() => {
      res.json({ status: true, stock: stock });
    })
    .catch((e) => {
      console.log(e);
      res.status(400).json({ status: "error" });
    });
};

price = (req, res) => {
  var ticker = req.query.ticker;
  var stock = {};
  var url;

  var profile = function () {
    var promise = new Promise(function (resolve, reject) {
      url = "https://finance.yahoo.com/quote/" + ticker + "?p=" + ticker;
      rp(url)
        .then(function (html) {
          stock.price = $("span[data-reactid='32']", html).eq(0).text();
          resolve();
        })
        .catch(function (err) {
          resolve();
        });
    });
    return promise;
  };

  profile()
    .then(() => {
      res.json({ status: true, stock: stock });
    })
    .catch((e) => {
      console.log(e);
      res.status(400).json({ status: "error" });
    });
};

dividendInfo = (req, res) => {
  var stock = {};
  console.log(req.body);
  var dates = req.body.dates;
  var companies = req.body.companies;
  var ticker = req.body.ticker;
  var date = new Date(req.body.date);

  var yearDate = date.getUTCFullYear();
  var monthDate = date.getUTCMonth() + 1; //months from 1-12

  var profile = function () {
    var promise = new Promise(function (resolve, reject) {
      for (const index in dates) {
        var date = new Date(dates[index]);
        var yearTemp = date.getUTCFullYear();
        var monthTemp = date.getUTCMonth() + 1;
        if (yearDate === yearTemp && monthDate === monthTemp) {
          stock.indexDate = index;
        }
      }
      for (const index in companies) {
        if (companies[index] === ticker) {
          stock.indexCompany = index;
        }
      }
      resolve();
    });
    return promise;
  };

  profile()
    .then(() => {
      res.json({ status: true, stock: stock });
    })
    .catch((e) => {
      console.log(e);
      res.status(400).json({ status: "error" });
    });
};

showTimes4 = (req, res) => {
  var ticker = req.query.ticker;
  var exchange =
    req.query.exchange === "USA-NYSE"
      ? "NYSE"
      : req.query.exchange === "USA-NASDAQ"
      ? "NASDAQ"
      : exchange;
  var stock = {};
  var url;

  var profile = function () {
    var promise = new Promise(function (resolve, reject) {
      url = "https://www.marketbeat.com/stocks/" + exchange + "/" + ticker;
      rp({ url: url, jar: true })
        .then(function (html) {
          $("a", html).each(function (index, element) {
            var elementText = $(this).text();
            if (elementText === "Price / Book") {
              stock.PB = $(this).next().text();
            }
          });
          resolve();
        })
        .catch(function (err) {
          resolve();
        });
    });
    return promise;
  };

  profile()
    .then(() => {
      res.json({ status: true, stock: stock });
    })
    .catch((e) => {
      console.log(e);
      res.status(400).json({ status: "error" });
    });
};
