var Cli = require('../');
var raft = require('raft');

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

function find() {
	cli.dropletFind(instance, function(err, msga) {
		console.log('dropletFind', err, msga);
		process.exit();
	});

}

function stopAll() {
	cli.dropletFind(instance, function(err, instances) {
		instances.forEach(function(instance) {
			stop(instance.instance)
		})
	});

}

function start() {
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

start();
