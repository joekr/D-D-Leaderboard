CharacterList = new Meteor.Collection("characters");
SubCharacterList = new Meteor.Collection("sub-characters");

Meteor.publish('characters', function() {
  return Lists.find();
});

Meteor.publish('sub-characters', function() {
  return Lists.find();
});

Meteor.startup(function () {
  // code to run on server at startup
});
