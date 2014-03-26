/*
 *
 * (C) 2013, MangoRaft.
 *
 */
var util = require('util');
var fs = require('fs');
var net = require('net');
var path = require('path');
var events = require('events');
var raft = require('raft');
/**
 *
 *
 */
var DeaClient = module.exports = function(config) {
	events.EventEmitter.call(this);
	process.configPath = config;
	raft.start();
	this.nats = raft.nats;
};
//
// Inherit from `events.EventEmitter`.
//
util.inherits(DeaClient, events.EventEmitter);

DeaClient.prototype.list = function(timmer, cb) {
	var replyEvent = 'dea.cli.reply.' + raft.common.uuid(true);
	var deas = [];
	var sidreply = raft.nats.subscribe(replyEvent, function(msg) {
		console.log(arguments)
		deas.push(msg);
	});
	setTimeout(function() {
		raft.nats.unsubscribe(sidreply);
		cb(null, deas);
	}, timmer || 30000);

	raft.nats.publish('dea.status', {}, replyEvent);
};

DeaClient.prototype.status = function(uid, cb) {
	var replyEvent = 'dea.cli.reply.' + raft.common.uuid(true);
	var deas = [];
	var sidreply = raft.nats.subscribe(replyEvent, function(msg) {
		raft.nats.unsubscribe(sidreply);
		cb(null, msg);
	})
	raft.nats.publish('dea.' + uid + '.status', {}, replyEvent);
};

DeaClient.prototype.start = function(instance, cb) {
	var replyEvent = 'dea.cli.reply.' + raft.common.uuid(true);
	var sidreply = raft.nats.subscribe(replyEvent, function(msg) {
		raft.nats.unsubscribe(sidreply);
		sidreply = raft.nats.subscribe(replyEvent, function(msg) {
			console.log('second', msg);
			raft.nats.unsubscribe(sidreply);
			cb(null, msg)
		});
		raft.nats.publish('dea.' + msg.id + '.start', instance, replyEvent);
	});
	raft.nats.publish('dea.discover', instance, replyEvent);
};

DeaClient.prototype.stop = function(instance, cb) {
	var replyEvent = 'dea.cli.reply.' + raft.common.uuid(true)
	var sidreply = raft.nats.subscribe(replyEvent, function(msg) {
		raft.nats.unsubscribe(sidreply)

		cb(null, msg)
	})
	raft.nats.publish('dea.stop', instance, replyEvent)
}

DeaClient.prototype.dropletStatus = function(instance, cb) {
	var replyEvent = 'dea.cli.reply.' + raft.common.uuid(true)
	var sidreply = raft.nats.subscribe(replyEvent, function(msg) {
		raft.nats.unsubscribe(sidreply)
		cb(null, msg)
	})
	raft.nats.publish('droplet.status', instance, replyEvent)
}

DeaClient.prototype.dropletFind = function(instance, cb) {
	this.waitReply('dea.find.droplet', instance, cb);
};

DeaClient.prototype.locate = function(cb) {
	var replyEvent = 'dea.cli.reply.' + raft.common.uuid(true)
	var sidreply = raft.nats.subscribe(replyEvent, function(msg) {
		raft.nats.unsubscribe(sidreply)
		cb(null, msg)
	})
	raft.nats.publish('dea.locate', {}, replyEvent)
}

DeaClient.prototype.waitReply = function(event, data, cb) {
	var replyEvent = 'dea.cli.reply.' + raft.common.uuid(true)
	var sidreply = raft.nats.subscribe(replyEvent, function(msg) {
		raft.nats.unsubscribe(sidreply)
		clearTimeout(timmer)
		cb(null, msg)
	})
	var timmer = setTimeout(function() {
		raft.nats.unsubscribe(sidreply);
		cb(new Error('no reply'));
	}, timmer || 10000);
	raft.nats.publish(event, data, replyEvent)
}

DeaClient.prototype.queryDea = function() {

}

DeaClient.prototype.queryDea = function() {

}

DeaClient.prototype.queryDea = function() {

}

DeaClient.prototype.queryDea = function() {

}
