if (Meteor.is_client) {
CharacterList = new Meteor.Collection("characters");

  Template.characters.events = {
    'click #add_button': function () {
      console.debug(parseInt($("#new-Initiative").val()));
      var obj = CharacterList.findOne({name:$("#new-character").val()});
      if(obj == null){
        CharacterList.insert({
          name:$("#new-character").val(),
          initiative:parseInt($("#new-Initiative").val())
        });
        $("#new-character").val("");
        $("#new-Initiative").val("");
      }else{
        CharacterList.update({name:$("#new-character").val()},{$set: {initiative:parseInt($("#new-Initiative").val())}});
      }
    }
  };


  Template.character_list.characters = function () {
    return CharacterList.find({}, {sort: {initiative: -1}});
  };

  Template.character.events = {
    'click .delete': function () {
      console.debug('delete'+this);
      CharacterList.remove(this._id);
    },
    'click .char_name': function (){
      console.debug('edit'+this);
      $("#new-character").val(this.name);
      $("#new-Initiative").val(this.initiative);
    }
  };
}

if (Meteor.is_server) {

  CharacterList = new Meteor.Collection("characters");
  Meteor.publish('characters', function () {
    return Lists.find();
  });

  Meteor.startup(function () {
    // code to run on server at startup
  });
}