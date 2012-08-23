CharacterList = new Meteor.Collection("characters");
EnemyList = new Meteor.Collection("enemies");

var playCharacterAudio = function(character) {
		//console.debug("Going to play character audio " + char.name);
		var audio = $('#char-name-audio');
		var audioPlayer = audio.get(0);

		if (typeof audio.attr('src') != 'undefined') {
			audioPlayer.pause();
			audioPlayer.currentTime = 0;
		}

		var audibleNames = ['xavia', 'thar'];
		var mp3Path = '/' + character.name + '.mp3';
		
		if ($.inArray(character.name.toLowerCase(), audibleNames) > -1) {
			audio.attr('src', mp3Path);
		} else if (character.isEnemy) {
			audio.attr('src', '/dragon.mp3');
		} else {
			audio.attr('src', '/next_character.mp3');
		}

		//audioPlayer.play();
	};

var setActiveTr = function(tr) {
		tr.addClass('active');
		var id = tr.attr('data-id');
		CharacterList.update({
			_id: id
		}, {
			$set: {
				active: true
			}
		});
		var character = CharacterList.findOne({_id: id});
		playCharacterAudio(character);
	};

var nextCharacter = function() {
		var tr = $('#character-table tbody tr.active');
		var nextCharID;
		if (tr.length < 1) {
			// No current active character, start with the first in the table,
			// i.e., the one with highest initiative
			var firstRow = $('#character-table tbody tr:first-child');
			nextCharID = firstRow.attr('data-id');
		} else {
			// Move to next character in the table, i.e., the one with the
			// next highest initiative
			tr.removeClass('active');
			var charID = tr.attr('data-id');
			CharacterList.update({
				_id: charID
			}, {
				$set: {
					active: false
				}
			});
			var nextCharRow = tr.next('[data-id!="' + charID + '"]');
			if (nextCharRow.length < 1) {
				nextCharRow = tr.parent().children('tr:first-child');
			}
			nextCharID = nextCharRow.attr('data-id');
		}
		setActiveTr($('#character-table tbody tr[data-id=' + nextCharID + ']'));
	};
	
var setupDMView = function() {
		console.debug("Setting up DM view");
		$('body').addClass('dm');
		$('#character-list-span').removeClass('span12').addClass('span6');
		$('#dm-view').show();
	};

var setupDMViewIfNecessary = function() {
		if (window.location.hash == '#dm') {
			setupDMView();
		}
	};
	
var fieldHasValue = function(nameField) {
		var name = nameField.val();
		var nameControlGroup = nameField.closest('.control-group');
		if ($.trim(name) == '') {
			nameControlGroup.addClass('error');
			return false;
		}
		nameControlGroup.removeClass('error');
		return true;
	};

Template.enemy_form.events = {
	'click #enemy-add-button': function() {
		var id = $('#enemy-id').val();
		var enemy = EnemyList.findOne({_id: id});

		var nameField = $('#enemy-name');
		var name = nameField.val();
		if (!fieldHasValue(nameField)) {
			return;
		}
		var initiative = parseInt($('#enemy-initiative').val(), 10);
		var maxHP = parseInt($('#enemy-max-hp').val(), 10);
		var curHP = parseInt($('#enemy-hp').val(), 10);
		if (null == enemy) {
			console.debug("Adding enemy #" + id);
			EnemyList.insert({
				name: name,
				initiative: initiative,
				active: false,
				inGame: true,
				maxHP: maxHP,
				currentHP: curHP
			});
		} else {
			console.debug("Updating enemy #" + id);
			EnemyList.update({
				_id: id
			}, {
				$set: {
					initiative: initiative,
					name: name,
					maxHP: maxHP,
					currentHP: curHP
				}
			});
		}
	}
};

Template.character_status_effects.hasEffect = function(effect) {
	return $.inArray(effect, this.effects || []) > -1;
};

Template.character_status_effects.events = {
	'change input[type=checkbox]': function(event) {
		var checkbox = $(event.currentTarget);
		var label = checkbox.next('label');
		var statusEffect = label.text().trim().toLowerCase();
		var character = CharacterList.findOne({
			_id: this._id
		});
		var controlGroup = checkbox.closest('.control-group');
		var effects = character.effects || [];
		if (checkbox.is(':checked')) {
			effects.push(statusEffect);
			controlGroup.addClass('checked');
		} else {
			var idx = $.inArray(statusEffect, effects);
			do {
				effects.splice(idx, 1);
				idx = $.inArray(statusEffect, effects);
			} while (idx > -1);
			controlGroup.removeClass('checked');
		}
		CharacterList.update({
			_id: this._id
		}, {
			$set: {
				effects: effects
			}
		});
	},
	'click a[href=#show-all]': function(event) {
		event.preventDefault();
		var link = $(event.currentTarget);
		var icon = $('i', link);
		var row = link.closest('tr.status-effects');
		if (icon.hasClass('icon-chevron-right')) {
			icon.removeClass('icon-chevron-right').addClass('icon-chevron-down');
			$('.control-group.infrequent', row).fadeIn().css("display","inline-block");
		} else {
			icon.removeClass('icon-chevron-down').addClass('icon-chevron-right');
			$('.control-group.infrequent:not(.checked)', row).fadeOut();
		}
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
		if (!fieldHasValue(nameField)) {
			return;
		}
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
				damage: damage,
				effects: []
			};
			console.debug("Inserting new character: " + JSON.stringify(charProps));
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
		$("#char-ac").val('');
		$("#char-fort").val('');
		$("#char-ref").val('');
		$("#char-will").val('');
		$("#char-dmg").val('');
		$('#character-id').val('');
		$('.navbar .control-group.error').removeClass('error');
	},
	'click #next-character-link': function() {
		nextCharacter();
		return false;
	}
};

Template.characters.onCharactersLoaded = function() {
	Meteor.defer(function () {
		setupDMViewIfNecessary();
	});
};

Template.enemy_list.events = {
	'click .char-name': function() {
		console.debug('edit'+this._id);		
		$("#enemy-id").val(this._id);
		$("#enemy-name").val(this.name);
		$("#enemy-initiative").val(this.initiative);
		$("#enemy-max-hp").val(this.maxHP);
		$("#enemy-hp").val(this.currentHP);
		
		$('#enemy-add-button').val('Edit');
	}
}

Template.enemy_list.enemies = function() {
	return EnemyList.find({
		inGame: true
	}, {
		sort: {
			initiative: -1,
			name: 1
		}
	});
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

Template.enemy.isBloodied = function() {
	return this.currentHP == (this.maxHP / 2);
};

Template.enemy.events = {
	'click .delete': function() {
		if (confirm("Are you sure you want to delete enemy " + this.name + "?")) {
			EnemyList.remove(this._id);
		}
		return false;
	},
	'click .current-and-max-hp': function(event) {
		var currentAndMaxHPSpan = $(event.currentTarget);
		if (currentAndMaxHPSpan.hasClass('editing')) {
			return;
		}
		currentAndMaxHPSpan.addClass('editing');
		var currentHPSpan = $('.current-hp', currentAndMaxHPSpan);
		var currentHP = currentHPSpan.text();
		var input = $('<input type="number">');
		input.val(currentHP);
		currentHPSpan.html(input);
		var enemy = this;
		var updateCurrentHP = function() {
			var newHP = parseInt(input.val(), 10);
			EnemyList.update({
				_id: enemy._id
			}, {
				$set: {
					currentHP: newHP
				}
			});
			input.remove();
			currentHPSpan.text(newHP);
			currentAndMaxHPSpan.removeClass('editing');
		};
		input.keypress(function(e) {
		    if (e.which == 13) { // Enter
				updateCurrentHP();
			}
		});
		input.blur(updateCurrentHP);
	}
};

var editCharacter = function(character) {
	$("#new-character").val(character.name);
	$("#new-initiative").val(character.initiative);
	$("#char-ac").val(character.char_ac);
	$("#char-fort").val(character.char_fort);
	$("#char-ref").val(character.char_ref);
	$("#char-will").val(character.char_will);
	$("#char-dmg").val(character.damage);
	$('#new-enemy').attr('checked', character.isEnemy);
	$('#in-game').attr('checked', character.char_in_game);
	$('#character-id').val(character._id);
	$('#add-button').val('Edit');
	$('html, body').animate({scrollTop: 0}, 500);
};

Template.character.events = {
	'click .delete': function() {
		//console.debug('delete' + this);
		if (confirm("Are you sure you want to delete character " + this.name + "?")) {
			CharacterList.remove(this._id);
		}
		return false;
	},
	'click .char-name': function() {
		editCharacter(this);
	},
	'click a[href=#retire]': function() {
		//console.debug("Retiring " + this.name);
		CharacterList.update({
			_id: this._id
		}, {
			$set: {
				char_in_game: false
			}
		});
		return false;
	}
};

Template.out_game_character_list.characters = function() {
	return CharacterList.find({
		char_in_game: false
	}, {
		sort: {
			name: 1
		}
	});
};

Template.out_game_character_list.events = {
	'click .delete': function() {
		//console.debug('delete' + this);
		if (confirm("Are you sure you want to delete " + this.name + "?")) {
			CharacterList.remove(this._id);
		}
		return false;
	},
	'click .char-name': function() {
		editCharacter(this);
	}
};

Template.out_character.events = {
	'click a[href=#bring-back]': function() {
		console.debug("Returning " + this.name + " to the fray!");
		CharacterList.update({
			_id: this._id
		}, {
			$set: {
				char_in_game: true
			}
		});
		return false;
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
	if ($(evt.target).is(":input")) {
		// Allow spaces in form fields without changing the active character
	    return;
	}
	if (evt.keyCode == 32) { // space
		evt.preventDefault();
		nextCharacter();
	}
});
