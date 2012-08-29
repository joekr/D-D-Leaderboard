CharacterList = new Meteor.Collection("characters");
SubCharacterList = new Meteor.Collection("sub-characters");
PartyBuffList = new Meteor.Collection("party-buffs");
ScratchPadList = new Meteor.Collection('scratch-pads');
SettingsList = new Meteor.Collection('settings');

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

Meteor.startup(function () {
  // code to run on server at startup
});
