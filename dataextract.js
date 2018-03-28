// Api/Libraries 

var webdriver = require('selenium-webdriver'), 
By = webdriver.By, until = webdriver.until;

var chrome = require('selenium-webdriver/chrome');

var co = new chrome.Options(); 
co.setChromeBinaryPath("/Applications/UsrBin/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"); 

var driver = new webdriver.Builder() .forBrowser("firefox") .setChromeOptions(co) .build();

var fs = require('fs');

YAML = require('yamljs');

// Pass File Into Script

var websites = fs.readFileSync("./urls.txt").toString('utf-8').split("\n");

var config= YAML.load('cred.yml');

var emailbody = '';


// Recursively go through all sites

function main(index){
  if (index == websites.length) {
    driver.quit();
    console.log(emailbody);
    var send = require('gmail-send')({
      user: config["config"]["email"],
      pass: config["config"]["password"],
      to:   config["config"]["email"],
      subject: 'I Did it!',
      text:   emailbody,
    });
    send({
    }, function (err, res) {
      console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
    });
  }
  else {
    start(index);
  }
}

// Start Test For Current Url
function start(index){
  driver.get('https://www.webpagetest.org').then(data_input(index));
}

//Fill Required Fields and Submit

function data_input(index){
  websiteurl = driver.findElement(By.id("url"));
  websiteurl.clear();
  websiteurl.sendKeys(websites[index]);
  submit_button = driver.findElement(By.className('start_test'));
  submit_button.click();
  driver.wait(until.elementLocated(By.id('LoadTime'))).then(function(){
    driver.getCurrentUrl().then(url => read_xml(url, index));
  });
}


// Navigate To XML Results Page

function read_xml(url,index){
  var new_url = url.replace('result', "xmlResult");
  var results = [];
  driver.navigate().to(new_url);
  driver.findElements(webdriver.By.xpath("/response/data/average/firstView/loadTime | /response/data/average/firstView/TTFB")).then(elements => parse_xml (elements,index));
}

// Retrieve Load Time and First Byte Values and Loop

function parse_xml(elements, index) {
  elements[0].getText().then(function(text){
    emailbody = emailbody + "Values are " + text + " (Load Time), ";
  });
  elements[1].getText().then(function(text) {
    emailbody = emailbody + text + " (First Byte), and is the website I used for " + websites[index] + "\n\n";
  }).then(function(){
    main(index + 1);
  });
}


// Run The Code

main(0);








