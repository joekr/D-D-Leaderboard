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
		var enemyNames = ['enemy', 'enemies', 'baddies', 'zombies', 'hobgoblins'];
		var mp3Path = '/' + charName + '.mp3';
		//var m4aPath = '/' + charName + '.m4a';
		if ($.inArray(charName, audibleNames) > -1) {
			audio.attr('src', mp3Path);
			//console.debug(audio);
			audioPlayer.play();
		} else if ($.inArray(charName, enemyNames) > -1) {
			audio.attr('src', '/dragon.mp3');
			audioPlayer.play();
		} else {
			audio.attr('src', '/next_character.mp3');
			audioPlayer.play();
		}
	};

var setActiveTr = function(tr) {
		tr.addClass('active');
		CharacterList.update({
			_id: tr.attr('id')
		}, {
			$set: {
				active: true
			}
		});
		var activeCharName = $('.char-name', tr).text().toLowerCase();
		playCharacterName(activeCharName);
	};

var nextCharacter = function() {
		var tr = $('#character-table tbody tr.active');
		if (tr.length < 1) {
			// No current active character, start with the first in the table,
			// i.e., the one with highest initiative
			setActiveTr($('#character-table tbody tr:first-child'));
		} else {
			// Move to next character in the table, i.e., the one with the
			// next highest initiative
			tr.removeClass('active');
			CharacterList.update({
				_id: tr.attr('id')
			}, {
				$set: {
					active: false
				}
			});
			var nextTr = tr.next();
			if (nextTr.length < 1) {
				nextTr = tr.parent().children('tr:first-child');
			}
			setActiveTr(nextTr);
		}
	};

Template.navbar.events = {
	'click #add-button': function() {
		var id = $('#character-id').val();
		var obj = CharacterList.findOne({
			_id: id
		});
		var nameField = $("#new-character");
		var name = nameField.val();
		var nameControlGroup = nameField.closest('.control-group');
		if ($.trim(name) == '') {
			nameControlGroup.addClass('error');
			return;
		}
		nameControlGroup.removeClass('error');
		var isEnemy = $('#new-enemy').is(':checked');
		var isInGame = $('#in-game').is(':checked');
		var initiativeVal = parseInt($("#new-initiative").val(), 10);
		var charAc = parseInt($("#char-ac").val(), 10);
		var charFort = parseInt($("#char-fort").val(), 10);
		var charRef = parseInt($("#char-ref").val(), 10);
		var charWill = parseInt($("#char-will").val(), 10);
		var damage = parseInt($("#char-dmg").val(), 10);
		if (null == obj) {
			var charProps = {
				name: name,
				initiative: initiativeVal,
				active: false,
				isEnemy: isEnemy,
				char_in_game: isInGame,
				char_ac: charAc,
				char_fort: charFort,
				char_ref: charRef,
				char_will: charWill,
				damage: damage
			};
			console.log("Inserting new character: " + JSON.stringify(charProps));
			CharacterList.insert(charProps);
		} else {
			console.debug("Updating character #" + id);
			CharacterList.update({
				_id: id
			}, {
				$set: {
					initiative: initiativeVal,
					isEnemy: isEnemy,
					name: name,
					char_ac: charAc,
					char_fort: charFort,
					char_ref: charRef,
					char_will: charWill,
					damage: damage,
					char_in_game: isInGame
				}
			});
		}
		$('#reset-button').click();
	},
	'click #reset-button': function() {
		$('#new-enemy').attr('checked', false);
		$('#in-game').attr('checked', true);
		$('#add-button').val('Add');
		$('#character-id').val('');
	},
	'click #next-character-link': function() {
		nextCharacter();
		return false;
	}
};

Template.character_list.characters = function() {
	return CharacterList.find({
		char_in_game: true
	}, {
		sort: {
			initiative: -1,
			name: 1
		}
	});
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
		$("#char-ac").val(this.char_ac);
		$("#char-fort").val(this.char_fort);
		$("#char-ref").val(this.char_ref);
		$("#char-will").val(this.char_will);
		$("#char-dmg").val(this.damage);
		$('#new-enemy').attr('checked', this.isEnemy);
		$('#in-game').attr('checked', this.char_in_game);
		$('#character-id').val(this._id);
		$('#add-button').val('Edit');
	}
};

Template.out_game_character_list.characters = function() {
	return CharacterList.find({
		char_in_game: false
	}, {
		sort: {
			initiative: -1,
			name: 1
		}
	});
};

Template.out_game_character_list.events = {
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
		$("#char-ac").val(this.char_ac);
		$("#char-fort").val(this.char_fort);
		$("#char-ref").val(this.char_ref);
		$("#char-will").val(this.char_will);
		$("#char-dmg").val(this.damage);
		$('#new-enemy').attr('checked', this.isEnemy);
		$('#in-game').attr('checked', this.char_in_game);
		$('#character-id').val(this._id);
		$('#add-button').val('Edit');
	}
};

var hasActiveChar = function() {
		return (CharacterList.find({
			active: true
		}).count() > 0);
	};

var activeRecord = function() {
		return CharacterList.findOne({
			active: true
		});
	};

$(document).keydown(function(evt) {
	if (evt.keyCode == 32) {
		evt.preventDefault();
		nextCharacter();
	}
});
