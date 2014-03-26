var Cli = require('../');
var raft = require('raft');
var pushover = require('pushover');
var exec = require('child_process').exec
var repos = pushover('/tmp/repos');
var express = require('express');
var quillTar = require('quill-tar');
var fs = require('fs');

var cli = new Cli(process.argv[2]);

var fileUpload = {
	droplet : 'file-upload',
	services : [],
	version : '1-1',
	sha1 : 'file-upload',
	instances : '8111b85a',
	executableFile : '???',
	executableUri : "/staged_droplets/#{droplet_id}/#{sha1}",
	name : 'flybyme',
	uris : ["file-upload.mangoraft.ca"],
	env : {

	},
	users : ['drnicwilliams@gmail.com'],
	runtime_info : {
		name : 'node8',
		executable : 'node'
	},
	framework : '',
	running : 'node8',
	limits : {
		mem : 20
	},
	cc_partition : 'default',
	http : true
};
var tarball = {
	droplet : 'tarball',
	services : [],
	version : '1-1',
	sha1 : 'tarball',
	instances : '8111b85a',
	executableFile : '???',
	executableUri : "/staged_droplets/#{droplet_id}/#{sha1}",
	name : 'flybyme',
	uris : ["tarball.mangoraft.ca"],
	env : {

	},
	users : ['drnicwilliams@gmail.com'],
	runtime_info : {
		name : 'node8',
		executable : 'node'
	},
	framework : '',
	running : 'node8',
	limits : {
		mem : 20
	},
	cc_partition : 'default',
	http : true
};
/*
 *
 *
 */
var instance = tarball;
/**
 *
 * @param {Object} instance_id
 */
function stop(instance_id) {
	cli.stop({
		droplet_id : instance.droplet,
		instance_id : instance_id
	}, function(err, msga) {
		console.log('stop', msga);
	});

}

function find(instance) {
	cli.dropletFind(instance, function(err, msga) {
		console.log('dropletFind', err, msga);
		process.exit();
	});

}

function stopAll(instance, cb) {
	cli.dropletFind(instance, function(err, instances) {
		instances.forEach(function(instance) {
			stop(instance.instance)
		})
		cb()
	});

}

function start(instance) {
	cli.list(5000, function(err, list) {

		console.log(err, list);
		cli.status(list[0].hello.id, function(err, msg) {
			console.log('status', msg);
			cli.start(instance, function(err, msga) {
				console.log('start', msga);
				cli.dropletStatus(msga, function(err, dea) {
					console.log('dropletStatus', dea);
					cli.locate(function(err, dea) {
						console.log('locate', dea);
						find()
					});
				});
			});
		});
	});
}

repos.on('push', function(push) {
	console.log(push)
	console.log('push ' + push.repo + '/' + push.commit + ' (' + push.branch + ')');
	push.accept();
	// Setup the git commands to be executed
	commands = ['mkdir ' + __dirname + '/pull/' + push.commit];

	commands[1] = 'cd ' + __dirname + '/pull/' + push.commit + ' && git clone http://localhost:7000/' + push.repo + '.git';
	console.log(commands)
	function executeUntilEmpty() {
		var command = commands.shift();

		// Remark: Using 'exec' here because chaining 'spawn' is not effective here
		exec(command, function(err, stdout, stderr) {
			if (err !== null) {
				console.log(err, false);
			} else if (commands.length > 0) {
				executeUntilEmpty();
			} else if (commands.length === 0) {
				quillTar.pack({
					dir : __dirname + '/pull/' + push.commit + '/' + push.repo
				}).pipe(fs.createWriteStream(__dirname + '/public/' + push.commit + '.tgz')).on('close', function() {
					console.log('end event')
					var instance = {
						droplet : push.repo,
						services : [],
						version : '1-1',
						sha1 : 'tarball',
						instances : '8111b85a',
						executableFile : '???',
						executableUri : "http://localhost:7001/" + push.commit + '.tgz',
						name : push.repo,
						uris : [push.repo + ".mangoraft.ca"],
						env : {

						},
						users : ['drnicwilliams@gmail.com'],
						runtime_info : {
							name : 'node8',
							executable : 'node'
						},
						framework : '',
						running : 'node8',
						limits : {
							mem : 20
						},
						cc_partition : 'default',
						http : true
					};

					stopAll(instance, function() {
						start(instance)
					});
				});

			}
		});
	}

	executeUntilEmpty();
});

repos.on('fetch', function(fetch) {
	console.log('fetch ' + fetch.commit);
	fetch.accept();
});

var http = require('http');
var server = http.createServer(function(req, res) {
	repos.handle(req, res);
});
server.listen(7000);

var app = module.exports = express.createServer(express.static(__dirname + '/public'));

app.listen(7001)
