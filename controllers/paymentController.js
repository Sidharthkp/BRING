const bodyParser = require("body-parser");
const instaMojo = require('instamojo-nodejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())