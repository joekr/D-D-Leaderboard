CharacterList = new Meteor.Collection("characters");
Meteor.publish('characters', function () {
  return Lists.find();
});

Meteor.startup(function () {
  // code to run on server at startup
});
