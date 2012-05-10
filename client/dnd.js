CharacterList = new Meteor.Collection("characters");

Template.characters.events = {
	'click #add-button': function () {
		var newInitiative = $("#new-initiative");
		var newChar = $("#new-character");
		console.debug(parseInt(newInitiative.val(), 10));
		var obj = CharacterList.findOne({name:newChar.val()});
		if (null == obj){
			CharacterList.insert({
				name: newChar.val(),
				initiative: parseInt(newInitiative.val(), 10),
				active: false
			});
			newChar.val("");
			newInitiative.val("");
		} else {
			CharacterList.update({
				name:newChar.val()
			}, {
				$set: {
					initiative:parseInt(newInitiative.val(), 10)
				}
			});
		}
	}
};

Template.character_list.characters = function () {
	return CharacterList.find(
		{},
		{
			sort: {
				initiative: -1,
				name:1
			}
		}
	);
};

Template.character.events = {
	'click .delete': function() {
		console.debug('delete' + this);
		CharacterList.remove(this._id);
	},
	'click .char_name': function(){
		console.debug('edit' + this.active);
		$("#new-character").val(this.name);
		$("#new-initiative").val(this.initiative);
	}
};

var hasActiveChar = function(){
	return (CharacterList.find({active: true}).count() > 0);
}

var activeRecord = function(){
	return CharacterList.findOne({active: true});
}

$(document).keydown(function(evt) {
	if (evt.keyCode == 32) {
		// GROSS!!! but it works for now
		var cur = CharacterList.find(
			{},
			{
				sort: {
					initiative: -1,
					name: 1
				}
			}
		);
		var nextShouldBeActive = false;
		var skip = false;
		var hasOneActive = hasActiveChar();
		var activeChar = activeRecord();
		cur.forEach(function(c) {        
			console.debug(JSON.stringify(c) + " - ");
			if (nextShouldBeActive || !hasOneActive){
				CharacterList.update(c, {$set: {active: true}});
				skip = true;
				hasOneActive = true;
				nextShouldBeActive = false;
			}
			if (undefined != c && undefined != activeChar && c._id == activeChar._id){
				CharacterList.update(c, {$set: {active: false}});
				nextShouldBeActive = true;
			}    
			skip = false;              
		});
	}
});
