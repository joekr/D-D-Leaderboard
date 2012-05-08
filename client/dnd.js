CharacterList = new Meteor.Collection("characters");

Template.characters.events = {
  'click #add_button': function () {
    console.debug(parseInt($("#new-Initiative").val()));
    var obj = CharacterList.findOne({name:$("#new-character").val()});
    if(obj == null){
      CharacterList.insert({
        name:$("#new-character").val(),
        initiative:parseInt($("#new-Initiative").val()),
        active:false
      });
      $("#new-character").val("");
      $("#new-Initiative").val("");
    }else{
      CharacterList.update({name:$("#new-character").val()},{$set: {initiative:parseInt($("#new-Initiative").val())}});
    }
  }
};

Template.character_list.characters = function () {
  return CharacterList.find({}, {sort: {initiative: -1,name:1}});
};

Template.character.events = {
  'click .delete': function () {
    console.debug('delete'+this);
    CharacterList.remove(this._id);
  },
  'click .char_name': function (){
    console.debug('edit'+this.active);
    $("#new-character").val(this.name);
    $("#new-Initiative").val(this.initiative);
  }
};

var hasActiveChar = function(){
  return (CharacterList.find({active: true}).count() > 0);
}

var activeRecord = function(){
  return CharacterList.findOne({active:true});
}

$(document).keydown(function(evt) {
if (evt.keyCode == 32) {
  // GROSS!!! but it works for now
      var cur = CharacterList.find({}, {sort: {initiative: -1,name:1}});
      var nextShouldBeActive = false;
      var skip = false;
      var hasOneActive = hasActiveChar();
      var activeChar = activeRecord();

      cur.forEach(function(c){        
        console.debug(JSON.stringify(c)+" - ");
        if(nextShouldBeActive || !hasOneActive){
          CharacterList.update(c,{$set: {active:true}});
          skip = true;
          hasOneActive = true;
          nextShouldBeActive = false;
        }

        if(c._id == activeChar._id){
          CharacterList.update(c,{$set: {active:false}});
          nextShouldBeActive = true;
        }    
        skip = false;              
      });
  }
});
