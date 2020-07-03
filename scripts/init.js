
const http = require('http')
const path = require('path')
const fs = require('fs')
var zlib = require('zlib')

const firstYear = 2020
const lastYear = 2021

let year = firstYear
let month = 1

const result = []
function nextYear() {
  const options = {
    hostname: 'sp0.baidu.com',
    port: 80,
    path: encodeURI(`/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=${year}年${month}月&co=&resource_id=39043&t=1593502057927&ie=utf8&oe=utf8&cb=op_aladdin_callback&format=json&tn=wisetpl&cb=jQuery110208089681101699495_1593501863364&_=1593501863378`),
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=gbk',
      'Accept-Encoding': 'gzip, deflate',
    }
  };

  const req = http.request(options, (res) => {
    var html = '';

    var html = '', output;
    if (res.headers['content-encoding'] == 'gzip') {
      var gzip = zlib.createGunzip();
      res.pipe(gzip);
      output = gzip;
    } else {
      output = res;
    }

    output.on('data', (data) => {
      html += data.toString('utf-8');
    })
    output.on('end', () => {
      const res = JSON.parse(html.slice(0, html.length - 2).slice(html.indexOf('{')))
      const { almanac } = res.data[0]
      almanac.forEach(d => {
        const { year, day, desc, status, month } = d
        if (status === '1' && !result.some(d => String(d.year) === year && String(d.day) === day && String(d.month) === month)) {
          result.push({
            year: Number(year),
            month: Number(month),
            day: Number(day),
            desc,
            status,
            time: new Date(`${year}/${month}/${day}`).getTime()
          })
        }
      })

      if (month === 12) {
        year += 1
        month = 1
      } else {
        month++
      }
      if (year < lastYear) {
        console.log(`progress:${year}-${month}/${lastYear}`);
        nextYear()
      } else {
        result.push({
          year: lastYear,
          month: 1,
          day: 1,
          desc: '元旦节',
          status: 1,
          time: new Date(`${lastYear}/${1}/${1}`).getTime()
        })
        fs.writeFile(path.resolve('./src/holiday.js'), `window.holiday = ${JSON.stringify(result)}`, 'utf8', () => {
        })
      }
    })
  });
  req.on('error', error => { console.log("error:" + error.message) });
  req.end();
}

nextYear()