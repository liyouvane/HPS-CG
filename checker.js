var fs = require('fs');
var child_process = require('child_process');

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

var ensure = function(data) {
	if (data.length > 0 && data.indexOf('\n', data.length - 1) !== -1) {
		return data;
	}
	return data + '\n';
}

var setup_checker = function(shell, args, input, cb) {
	var p = child_process.spawn(shell, args);
	let out = '';
	let err = '';
	p.stdout.on('data', function(data) { out += data; });
	p.stderr.on('data', function(data) { err += data; });
	p.on('close', function (exitCode) { cb(exitCode, out, err); });
	p.stdin.end(input);
}

var update_problem = function(data, code, id, cb) {
	var contest = get_contest(id);
	var player = contest.players[code];
	setup_checker(
			'build/checker',
			[],
			contest.numpackages + ' ' + contest.numversions + ' ' + contest.numcompatibles + '\n' + data,
			function(exitCode, out, err) {
				if (exitCode != 0) {
					cb(false);
				} else {
					player.input = out;
					player.raw = ensure(data);
					cb(true);
				}
			});
}

var update_solution = function(data, code, poser, id, cb) {
	var contest = get_contest(id);
	setup_checker(
			'build/checker',
			['1'],
			contest.numpackages + ' ' + contest.numversions + ' ' + contest.numcompatibles + '\n' + contest.players[poser].raw + data,
			function(exitCode, out, err) {
				if (exitCode != 0) {
					cb(false);
				} else {
					if (err.length > 0) { // win!
						if (!contest.players[code].hasOwnProperty('win')) {
							contest.players[code].win = {};
						}
						contest.players[code].win[poser] = true;
					}
					cb(true);
				}
			});
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