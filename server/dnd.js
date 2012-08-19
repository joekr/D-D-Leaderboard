CharacterList = new Meteor.Collection("characters");
EnemyList = new Meteor.Collection("enemies");

Meteor.publish('characters', function() {
  return Lists.find();
});

Meteor.publish('enemies', function() {
	return Lists.find();
});

Meteor.startup(function () {
  // code to run on server at startup
});
