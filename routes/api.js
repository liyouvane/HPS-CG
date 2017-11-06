var express = require('express');
var router = express.Router();
var checker = require('../checker');

/* Helpers */
var check_contest = function(id, res) {
	const failure = {success: false, msg: 'Invalid contest!'};
	if (isNaN(id) || id < 0 || checker.get_contest(id) == null) {
		res.json(failure);
		return false;
	}
	return true;
}
var check_problem = function(name, id, res) {
	const failure_wait = {success: false, msg: 'Contest has not yet started!'};
	const failure = {success: false, msg: 'Problem not found!'};
	var contest = checker.get_contest(id);
	var poser = checker.get_player_code(name, id);
	if ((new Date()).getTime() < (new Date(contest.date1)).getTime()) {
		res.json(failure_wait);
		return false;
	}
	if (poser == null) {
		res.json(failure);
		return false;
	}
	return true;
}
var check_code = function(code, id, res) {
	const failure = {success: false, msg: 'Invalid code!'};
	var contest = checker.get_contest(id);
	if (!contest.players.hasOwnProperty(code)) {
		res.json(failure);
		return false;
	}
	return true;
}
var check_post = function(code, id, res) {
	const failure = {success: false, msg: 'Expired!'};
	const failure_locked = {success: false, msg: 'Locked! Cannot modify anymore.'};
	var contest = checker.get_contest(id);
	if ((new Date()).getTime() > (new Date(contest.date2)).getTime()) {
		res.json(failure);
		return false;
	}
	var access_time = checker.get_access_time(code, code, id);
	if (access_time != null
			&& (new Date()).getTime() > access_time.getTime() + 1000 * 120) {
		res.json(failure);
		return false;
	}
	if (contest.players[code].hasOwnProperty('locked')) {
		res.json(failure_locked);
		return false;
	}
	return true;
}
var check_solver = function(poser, code, id, res) {
	const failure = {success: false, msg: 'Expired!'};
	var contest = checker.get_contest(id);
	if ((new Date()).getTime() > (new Date(contest.date3)).getTime()) {
		res.json(failure);
		return false;
	}
	var access_time = checker.get_access_time(poser, code, id);
	if (access_time != null
			&& (new Date()).getTime() > access_time.getTime() + 1000 * 120) {
		res.json(failure);
		return false;
	}
	return true;
}

/* GET api. */
router.get('/', function(req, res) {
	res.send('respond with a resource');
});

/* create a contest */
router.get('/create', function(req, res) {
	const failure = {success: false, msg: 'Invalid parameters!'};
	var numpackages = parseInt(req.query.numpackages);
	var numversions = parseInt(req.query.numversions);
	var numcompatibles = parseInt(req.query.numcompatibles);
	var date1 = new Date(req.query.date1);
	var date2 = new Date(req.query.date2);
	var date3 = new Date(req.query.date3);
	if (isNaN(numpackages) || isNaN(numversions) || isNaN(numcompatibles)
			|| isNaN(date1.getTime()) || isNaN(date2.getTime()) || isNaN(date3.getTime())
			|| (numpackages <= 0) || (numpackages > 20)
			|| (numversions <= 0) || (numversions > 40)
			|| (numcompatibles <= 0) || (numcompatibles > 10000)
			|| (date2.getTime() <= date1.getTime()) || (date3.getTime() <= date2.getTime())) {
		res.json(failure);
	} else {
		var id = checker.add_contest(numpackages, numversions, numcompatibles, date1, date2, date3);
		res.json({success: true, id: id});
	}
});

/* register for a contest */
router.get('/register', function(req, res) {
	const failure_contest = {success: false, msg: 'Contest has ended.'};
	const failure_name = {success: false, msg: 'Invalid team name! Only alphanumeric character from the basic Latin alphabet, including the underscore is allowed. Also, do not use names similar to other team.'};
	var id = parseInt(req.query.id);
	var name = req.query.name;
	if (!check_contest(id, res)) {
		return;
	}
	var contest = checker.get_contest(id);
	if ((new Date()).getTime() > (new Date(contest.date3)).getTime()) {
		res.json(failure_contest);
	} else if (name.length > 32 || name.match(/\w(\w|' ')*/) == null
			|| !checker.is_valid_name(name, id)) {
		res.json(failure_name);
	} else {
		var code = checker.add_player(name, id);
		res.json({success: true, code: code});
	}
});

router.get('/get', function(req, res) {
	const failure = {success: false, msg: 'Unable to retrieve data.'};
	const failure_wait = {success: false, msg: 'Contest has not yet started.'};
	var id = parseInt(req.query.id);
	var pid = req.query.pid;
	var role = req.query.role;
	var code = req.query.code;
	if (!check_contest(id, res) || !check_problem(pid, id, res) || !check_code(code, id, res)) {
		return;
	}
	var contest = checker.get_contest(id);
	var poser = checker.get_player_code(pid, id);
	if ((new Date()).getTime() < (new Date(contest.date1))) {
		res.json(failure_wait);
	} else if (role == 'poser' && poser == code) {
		checker.set_access_time(poser, code, id);
		res.json({success: true, data: contest.numpackages + ' ' + contest.numversions + ' ' + contest.numcompatibles + '\n'});
	} else if (role == 'solver' && poser != code && contest.players[poser].hasOwnProperty('input')) {
		checker.set_access_time(poser, code, id);
		contest.players[poser].locked = true;
		res.json({success: true, data: contest.numpackages + ' ' + contest.numversions + ' ' + contest.players[poser].input})
	} else {
		res.json(failure);
	}
});

router.post('/submit', function(req, res) {
	const failure = {success: false, msg: 'Illegal access.'};
	const failure_format = {success: false, msg: 'Output format error.'};
	var id = parseInt(req.query.id);
	var pid = req.query.pid;
	var role = req.query.role;
	var code = req.query.code;
	var data = req.body.data;
	if (!check_contest(id, res) || !check_problem(pid, id, res) || !check_code(code, id, res)) {
		return;
	}
	var contest = checker.get_contest(id);
	var poser = checker.get_player_code(pid, id);
	if (role == 'poser' && poser == code) {
		if (!check_post(poser, id, res)) {
			return;
		}
		checker.update_problem(data, code, id, function(success) {
			if (success) {
				res.json({success: true, msg: 'Submitted.'});
			} else {
				res.json(failure_format);
			}
		});
	} else if (role == 'solver' && poser != code && contest.players[poser].hasOwnProperty('input')) {
		if (!check_solver(poser, code, id, res)) {
			return;
		}
		contest.players[poser].locked = true;
		checker.update_solution(data, code, poser, id, function(success) {
			if (success) {
				res.json({success: true, msg: 'Submitted.'});
			} else {
				res.json(failure_format);
			}
		});
	} else {
		res.json(failure);
	}
});

module.exports = router;
