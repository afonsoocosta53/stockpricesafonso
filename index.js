const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;
const rp = require("request-promise");
const $ = require("cheerio");

express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/stockInfo", (req, res) => showTimes(req, res))
  .get("/stockInfo2", (req, res) => showTimes2(req, res))
  .get("/stockInfo3", (req, res) => showTimes3(req, res))
  .get("/price", (req, res) => price(req, res))
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
