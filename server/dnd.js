CharacterList = new Meteor.Collection("characters");
SubCharacterList = new Meteor.Collection("sub-characters");
PartyBuffList = new Meteor.Collection("party-buffs");
ScratchPadList = new Meteor.Collection('scratch-pads');
SettingsList = new Meteor.Collection('settings');
var fs;
var cp;


Meteor.publish('characters', function() {
  return Lists.find();
});

Meteor.publish('sub-characters', function() {
  return Lists.find();
});

Meteor.publish('party-buffs', function() {
  return Lists.find();
});

Meteor.publish('scratch-pads', function() {
  return Lists.find();
});

Meteor.publish('settings', function() {
  return Lists.find();
});

Meteor.methods({
        export_db: function() {
            console.log("EXPORTING DB");                     

            var writeCharacters = cp.spawn("mongoexport",['-h','localhost:3002','-d','meteor','-out','DndBackup/characters','-c','characters'])
            writeCharacters.stdout.on('data', function (data) {
			  console.log('characters stdout: ' + data);
			});

            var writeEnemies = cp.spawn("mongoexport",['-h','localhost:3002','-d','meteor','-out','DndBackup/enemies','-c','enemies'])
            writeEnemies.stdout.on('data', function (data) {
			  console.log('enemies stdout: ' + data);
			});

            var writePartyBuffs = cp.spawn("mongoexport",['-h','localhost:3002','-d','meteor','-out','DndBackup/party-buffs','-c','party-buffs'])
            writePartyBuffs.stdout.on('data', function (data) {
			  console.log('party-buffs stdout: ' + data);
			});

			var writeScratchPads = cp.spawn("mongoexport",['-h','localhost:3002','-d','meteor','-out','DndBackup/scratch-pads','-c','scratch-pads'])
            writeScratchPads.stdout.on('data', function (data) {
			  console.log('scratch-pads stdout: ' + data);
			});

			var writeSubCharacters = cp.spawn("mongoexport",['-h','localhost:3002','-d','meteor','-out','DndBackup/sub-characters','-c','sub-characters'])
            writeSubCharacters.stdout.on('data', function (data) {
			  console.log('sub-characters stdout: ' + data);
			});

			var writeSystemIndexes = cp.spawn("mongoexport",['-h','localhost:3002','-d','meteor','-out','DndBackup/system_indexes','-c','system.indexes'])
            writeSystemIndexes.stdout.on('data', function (data) {
			  console.log('system.indexes stdout: ' + data);
			});			
        },
    });

Meteor.startup(function () {
  // code to run on server at startup
  var require = __meteor_bootstrap__.require;
  fs = require('fs');
  cp = require('child_process');
  		
});
