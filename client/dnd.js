CharacterList = new Meteor.Collection("characters");

var playCharacterName = function(charName) {
	//console.debug("Going to play character audio " + charName);
	var audio = $('#char-name-audio');
	var audioPlayer = audio.get(0);
	if (typeof audio.attr('src') != 'undefined') {
		audioPlayer.pause();
		audioPlayer.currentTime = 0;
	}
	var audibleNames = ['xavia', 'thar', 'dragon'];
	var mp3Path = '/' + charName + '.mp3';
	//var m4aPath = '/' + charName + '.m4a';
	if ($.inArray(charName, audibleNames) > -1) {
		audio.attr('src', mp3Path);
		//console.debug(audio);
		audioPlayer.play();
	} else if ('enemy' == charName ||
			'enemies' == charName ||
			'baddies' == charName) {
		audio.attr('src', '/dragon.mp3');
		audioPlayer.play();
	}
};

var nextCharacter = function() {
	var setActiveTr = function(tr) {
		tr.addClass('active');
		CharacterList.update({_id: tr.attr('id')}, {$set: {active: true}});
		var activeCharName = $('.char-name', tr).text().toLowerCase();
		playCharacterName(activeCharName);
	};
	var tr = $('#character-table tbody tr.active');
	if (tr.length < 1) {
		// No current active character, start with the first in the table,
		// i.e., the one with highest initiative
		setActiveTr($('#character-table tbody tr:first-child'));
	} else {
		// Move to next character in the table, i.e., the one with the
		// next highest initiative
		tr.removeClass('active');
		CharacterList.update({_id: tr.attr('id')}, {$set: {active: false}});
		var nextTr = tr.next();
		if (nextTr.length < 1) {
			nextTr = tr.parent().children('tr:first-child');
		}
		setActiveTr(nextTr);
	}
};

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
	},
	'click #next-character-link': function() {
		nextCharacter();
		return false;
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
};

var activeRecord = function() {
	return CharacterList.findOne({active: true});
};

$(document).keydown(function(evt) {
	if (evt.keyCode == 32) {
		nextCharacter();
	}
});
