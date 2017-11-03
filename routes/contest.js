var fs = require('fs');
var express = require('express');
var router = express.Router();
var checker = require('../checker')

/* GET contest. */
router.get('/:contestId', function(req, res) {
	var id = parseInt(req.params.contestId);
	var contest = checker.get_contest(id);
	if (!isNaN(id) || contest != null) {
		var ranking = [];
		var scores = {};
		for (var code in contest.players) {
			scores[code] = 0;
		}
		for (var poser in contest.players) {
			for (var code in contest.players) {
				if (poser == code) {
					continue;
				}
				if (contest.players[code].hasOwnProperty('win') && contest.players[code].win.hasOwnProperty(poser)) {
					scores[code] += 1;
				} else if (!contest.players[poser].hasOwnProperty('input')) {
					scores[code] += 1;
				} else {
					scores[poser] += 1;
				}
			}
		}
		for (var code in scores) {
			ranking.push([scores[code], code]);
		}
		ranking = ranking.sort(function(a, b) { return a[0] - b[0]; }).reverse();
		res.render('contest', { title: contest.name, contest: contest, id: id, ranking: ranking });
	} else {
		res.redirect('/');
	}
});

/* GET problem. */
router.get('/:contestId/problem/:problemId', function(req, res) {
	var id = parseInt(req.params.contestId);
	var pid = req.params.problemId;
	if (!isNaN(id)) {
		var contest = checker.get_contest(id);
		if (contest != null) {
			var code = checker.get_player_code(pid, id);
			if (code != null) {
				res.render('problem', { title: pid, contest: contest, id: id, code: code });
				return;
			}
		}
	}
	res.redirect('/');
});

module.exports = router;
