const moment = require('moment');

module.exports = fetch, print;

module.exports = {
  fetch: fetch,
  print: print
}

const https = require('https');

function get_maintenances_urls(data) {
  const parsed_data = JSON.parse(data);
  const maintenances = parsed_data.NewsList.filter(function(elem) {
    const parsed_caption = JSON.parse(elem.Caption);
    return parsed_caption.en.toLowerCase() === 'maintenance';
  });

  return maintenances.map(maintenance => maintenance.Url.replace(/\/\[@@\]/i, 'en'));
}

function get_maintenance_period(urls) {
  url = urls.shift();

  let period_promise = new Promise((accept, reject) => {

    https.get(url, (response) => {
      let data = '';
     
      response.on('data', (chunk) => {data += chunk;});
     
      response.on('end', () => {
        const period_regex = /<b>\[Maintenance Period\]<\/b>\s+<br \/>\s+(.*)\s([A-Z]+)/g;
        match = period_regex.exec(data);
        accept(match);
      });
     
    }).on("error", (error) => {
      reject(error);
    });
    
  });

  return period_promise.then(regex_match => {
    if (regex_match !== null) {
      return regex_match;
    } else if (urls.length > 0) {
      return get_maintenance_period(urls);
    } else {
      return null;
    }
  }, error => error);

}

function format_period(regex_match){
  //console.log(regex_match[1]); // Period
  //console.log(regex_match[2]); // Time Zone

  const dates = regex_match[1].split(' - ');
  const start = dates[0] + ' 2018 ' + regex_match[2]; // Wednesday 5/30 23:00 
  const end = dates[1] + ' 2018 ' + regex_match[2]; // Thursday 5/31 5:00

  let start_date = new Date(start);
  let end_date = new Date(end);

  return {start: start_date, end: end_date};
}

function fetch() {
  return new Promise((accept, reject) => {

    https.get('https://deathsnacks.com/ffbe/news_gl.json', (response) => {
      let data = '';
     
      response.on('data', (chunk) => {data += chunk;});
     
      response.on('end', () => {
        
        const urls = get_maintenances_urls(data);
        if (urls.length > 0) {

          get_maintenance_period(urls).then(regex_match => {
            if (regex_match === null){
              reject('No maintenance info found');
            } else {
              accept(format_period(regex_match));
            }
          }, error => {
            reject(error);
          });

        } else {
          reject('No maintenance info found')
        }    

      });
     
    }).on("error", (error) => {
      reject(error)
    });

  });
}

function print(result, timezone) {
  let start = result.start;
  let end = result.end;

  start.setUTCHours(start.getUTCHours() + timezone);
  end.setUTCHours(end.getUTCHours() + timezone);

  const format = "dddd, H:mm:ss";

  let text = "<b>ANNOUNCEMENT:</b> Maintenance starting soon" +
  "\n Starting time: " + moment.utc(start).format(format) +
  "\n Ending time: " + moment.utc(end).format(format);
  return text;
}

/*
fetch().then(result => {
  console.log(result);

}, error => console.log("Error: " + error));
*/