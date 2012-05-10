CharacterList = new Meteor.Collection("characters");

Template.characters.events = {
	'click #add-button': function() {
		var newInitiative = $("#new-initiative");
		var newChar = $("#new-character");
		var newEnemy = $('#new-enemy');
		var id = $('#character-id').val();
		var obj = CharacterList.findOne({_id: id});
		var isEnemy = newEnemy.is(':checked');
		var initiativeVal = parseInt(newInitiative.val(), 10);
		var name = newChar.val();
		if (null == obj){
			CharacterList.insert({
				name: name,
				initiative: initiativeVal,
				active: false,
				isEnemy: isEnemy
			});
		} else {
			console.debug("Updating ID " + id);
			CharacterList.update({
				_id: id
			}, {
				$set: {
					initiative: initiativeVal,
					isEnemy: isEnemy,
					name: name
				}
			});
		}	
		$('#reset-button').click();
	},
	'click #reset-button': function() {
		$('#new-enemy').attr('checked', false);
		$('#add-button').val('Add');
		$('#character-id').val('');
	}
};

Template.character_list.characters = function () {
	return CharacterList.find(
		{},
		{
			sort: {
				initiative: -1,
				name: 1
			}
		}
	);
};

Template.character.events = {
	'click .delete': function() {
		console.debug('delete' + this);
		if (confirm("Are you sure you want to delete character " + this.name + "?")) {
			CharacterList.remove(this._id);
		}
	},
	'click .char-name': function() {
		console.debug('edit' + this.active);
		$("#new-character").val(this.name);
		$("#new-initiative").val(this.initiative);
		$('#new-enemy').attr('checked', this.isEnemy);
		$('#character-id').val(this._id);
		$('#add-button').val('Edit');
	}
};

var hasActiveChar = function() {
	return (CharacterList.find({active: true}).count() > 0);
}

var activeRecord = function() {
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
