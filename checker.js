var fs = require('fs');

/* Constants */
const config_filename = 'config.json';
const config_backup_filename = 'config.json.bak';

/* Read Config File */
var storage = {};
if (fs.existsSync(config_filename)) {
	storage = JSON.parse(fs.readFileSync(config_filename));
}

/* Manipulation */
var add_contest = function(numpackages, numversions, numcompatibles, date1, date2, date3) {
	if (!storage.hasOwnProperty('contests')) {
		storage.contests = [];
	}
	var id = storage.contests.length;
	storage.contests.push({
		numpackages: numpackages,
		numversions: numversions,
		numcompatibles: numcompatibles,
		date1: date1,
		date2: date2,
		date3: date3,
		name: 'Contest ' + id,
		players: {},
	});
	return id;
}

var get_contests = function() {
	if (!storage.hasOwnProperty('contests')) {
		return [];
	}
	return storage.contests;
}

var get_contest = function(id) {
	return get_contests()[id];
}

var is_similar = function(name1, name2) {
	var counter1 = name1.toLowerCase().replace(/ /g, '').split('').sort();
	var counter2 = name2.toLowerCase().replace(/ /g, '').split('').sort();
	var eq = 0;
	for (var i = 0; i < counter1.length && i < counter2.length; ++ i) {
		if (counter1[i] == counter2[i]) {
			eq += 1;
		}
	}
	return eq / Math.max(counter1.length, counter2.length) > 0.7;
}

var is_valid_name = function(name, id) {
	for (var code in storage.contests[id].players) {
		var player = storage.contests[id].players[code];
		var others = player.name;
		if (is_similar(name, others)) {
			return false;
		}
	}
	return true;
}

var add_player = function(name, id) {
	var code = Math.floor(Math.random() * 1000000);
	while (storage.contests[id].players.hasOwnProperty(code)) {
		code = Math.floor(Math.random() * 1000000);
	}
	storage.contests[id].players[code] = {name: name, score: {}};
	return code;
}

var get_player_code = function(name, id) {
	for (var code in storage.contests[id].players) {
		var player = storage.contests[id].players[code];
		if (name == player.name) {
			return code;
		}
	}
	return null;
}

var set_access_time = function(poser, code, id) {
	var contest = get_contest(id);
	if (!contest.players[code].hasOwnProperty('get')) {
		contest.players[code].get = {};
	}
	if (!contest.players[code].get.hasOwnProperty(poser)) {
		contest.players[code].get[poser] = new Date();
	}
}

var get_access_time = function(poser, code, id) {
	var contest = get_contest(id);
	if (!contest.players[code].hasOwnProperty('get')) {
		return null;
	}
	if (!contest.players[code].get.hasOwnProperty(poser)) {
		return null;
	}
	return new Date(contest.players[code].get[poser]);
}

var build_edge = function(a, b, c, d) {
	var x = a + ' ' + b;
	var y = c + ' ' + d;
	if (x < y) {
		return x + ' ' + y;
	} else {
		return y + ' ' + x;
	}
}

var update_problem = function(data, code, id) {
	var lines = data.split(/\r\n|\n/);
	if (lines.length == 0) {
		return false;
	}
	var m = parseInt(lines[0]);
	var contest = get_contest(id);
	var player = contest.players[code];
	if (isNaN(m) || m < 0 || m > contest.numcompatibles) {
		return false;
	}
	if (lines.length < m + 2) {
		return false;
	}
	var input = m + '\n';
	var graph = {};
	for (var i = 1; i <= m; ++ i) {
		var line = lines[i].split(/\s+/);
		if (line.length != 4) {
			return false;
		}
		var a = parseInt(line[0]);
		var b = parseInt(line[1]);
		var c = parseInt(line[2]);
		var d = parseInt(line[3]);
		if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)
				|| a <= 0 || a > contest.numpackages
				|| b <= 0 || b > contest.numversions
				|| c <= 0 || c > contest.numpackages
				|| d <= 0 || d > contest.numversions) {
			return false;
		}
		var edge = build_edge(a, b, c, d);
		graph[edge] = true;
		input += edge + '\n';
	}
	var k = parseInt(lines[m + 1]);
	if (k <= 0 || lines.length < m + k + 2) {
		return false;
	}
	var sol = [];
	for (var i = m + 2; i < m + k + 2; ++ i) {
		var line = lines[i].split(/\s+/).map((i) => (+i));
		if (line.length != contest.numpackages) {
			return false;
		}
		for (var a = 1; a <= contest.numpackages; ++ a) {
			for (var c = a + 1; c <= contest.numpackages; ++ c) {
				if (!graph.hasOwnProperty(build_edge(a, line[a - 1], c, line[c - 1]))) {
					return false;
				}
			}
		}
		sol.push(line);
	}
	player.input = input;
	player.graph = graph;
	player.sol = sol;
	return true;
}

var update_solution = function(data, code, poser, id) {
	var lines = data.split(/\r\n|\n/);
	if (lines.length == 0) {
		return false;
	}
	var k = parseInt(lines[0]);
	if (k <= 0 || lines.length < k + 1) {
		return false;
	}
	var contest = get_contest(id);
	var graph = contest.players[poser].graph;
	var sol = [];
	for (var i = 1; i <= k; ++ i) {
		var line = lines[i].split(/\s+/).map((i) => (+i));
		if (line.length != contest.numpackages) {
			return false;
		}
		for (var a = 1; a <= contest.numpackages; ++ a) {
			for (var c = a + 1; c <= contest.numpackages; ++ c) {
				if (!graph.hasOwnProperty(build_edge(a, line[a - 1], c, line[c - 1]))) {
					return false;
				}
			}
		}
		sol.push(line);
	}
	// now see who wins?
	var win = true;
	for (var i = 0; i < sol.length; ++ i) {
		win = true;
		for (var j = 0; j < contest.players[poser].sol.length; ++ j) {
			var comparable = true;
			var greater = false;
			var smaller = false;
			for (var p = 0; p < contest.numpackages; ++ p) {
				if (sol[i][p] >= contest.players[poser].sol[j][p]) {
					greater = true;
				} else {
					smaller = true;
				}
			}
			if (!greater && smaller) {
				win = false;
			}
		}
		if (win) {
			break;
		}
	}
	if (win) {
		if (!contest.players[code].hasOwnProperty('win')) {
			contest.players[code].win = {};
		}
		contest.players[code].win[poser] = true;
	}
	return true;
}

/* Regularly, save the current storage into a file. */
var save_work = function() {
	fs.rename(config_filename, config_backup_filename, function(err) {
		if (err) {
			console.log(err);
		}
		fs.writeFileSync(config_filename, JSON.stringify(storage));
	});
};
setInterval(save_work, 1000 * 1200); // save work every 1200 seconds.

exports.add_contest = add_contest;
exports.get_contests = get_contests;
exports.get_contest = get_contest;
exports.is_valid_name = is_valid_name;
exports.add_player = add_player;
exports.get_player_code = get_player_code;
exports.set_access_time = set_access_time;
exports.get_access_time = get_access_time;
exports.update_problem = update_problem;
exports.update_solution = update_solution;