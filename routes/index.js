var express = require('express');
var router = express.Router();
var checker = require('../checker');

/* GET home page. */
router.get('/', function(req, res) {
	var contests = checker.get_contests();
	res.render('alpha', { title: 'Compatibility Game', contests: contests });
});

/* GET create contest page. */
router.get('/create', function(req, res) {
	res.render('create', { title: 'Hold a Contest' });
});

module.exports = router;
