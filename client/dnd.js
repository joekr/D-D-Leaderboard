CharacterList = new Meteor.Collection("characters");
SubCharacterList = new Meteor.Collection("sub-characters");
PartyBuffList = new Meteor.Collection("party-buffs");
ScratchPadList = new Meteor.Collection("scratch-pads");
SettingsList = new Meteor.Collection("settings");

var getAppSettings = function() {
		return SettingsList.findOne() || {};
	};
	
var saveAppSettings = function(settings) {
		if (SettingsList.find().count() < 1) {
			SettingsList.insert(settings);
			return;
		}
		var id = settings._id;
		delete settings['_id']; // prevent 500 error
		SettingsList.update({
			_id: id
		}, {
			$set: settings
		});
	};

var addNewSubEnemy = function(charID, props) {
		SubCharacterList.insert({
			charID: charID,
			name: props.name,
			currentHP: props.currentHP,
			maxHP: props.maxHP,
			isEnemy: true
		});
	};

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

		audioPlayer.play();
	};

var setActiveTr = function(tr) {
		tr.addClass('active');
		var id = tr.attr('data-char-id');
		CharacterList.update({
			_id: id
		}, {
			$set: {
				active: true
			}
		});
		var character = CharacterList.findOne({_id: id});
		var settings = getAppSettings();
		if (typeof character !== 'undefined' && settings.sound) {
			playCharacterAudio(character);
		}
	};

var nextCharacter = function() {
		var tr = $('#character-table tbody tr.active');
		var nextCharID;
		if (tr.length < 1) {
			// No current active character, start with the first in the table,
			// i.e., the one with highest initiative
			var firstRow = $('#character-table tbody tr:first-child');
			nextCharID = firstRow.attr('data-char-id');
		} else {
			// Move to next character in the table, i.e., the one with the
			// next highest initiative
			tr.removeClass('active');
			var charID = tr.attr('data-char-id');
			CharacterList.update({
				_id: charID
			}, {
				$set: {
					active: false
				}
			});
			var nextCharRow = tr.next('[data-char-id!="' + charID + '"]');
			if (nextCharRow.length < 1) {
				nextCharRow = tr.parent().children('tr:first-child');
			}
			nextCharID = nextCharRow.attr('data-char-id');
		}
		setActiveTr($('#character-table tbody tr[data-char-id=' + nextCharID + ']'));
	};
	
Template.navbar_outer.soundIcon = function() {
	var settings = getAppSettings();
	return settings.sound ? 'icon-volume-up' : 'icon-volume-off';
};

Template.navbar_outer.soundStatus = function() {
	var settings = getAppSettings();
	return settings.sound ? "on" : "off";
};

Template.navbar_outer.events = {
	'click a[href=#next]': function(event) {
		nextCharacter();
		return false;
	},
	'click a[href=#sound]': function(event) {
		var link = $(event.currentTarget);
		var icon = $('i', link);
		var settings = getAppSettings();
		if (settings.sound) {
			icon.removeClass('icon-volume-up').addClass('icon-volume-off');
			settings.sound = false;
		} else {
			icon.removeClass('icon-volume-off').addClass('icon-volume-up');
			settings.sound = true;
		}
		saveAppSettings(settings);
		return false;
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

var showEnemyHealthFieldsetIfNecessary = function() {
		var isEnemy = $('#new-enemy').is(':checked');
		var isDungeonMaster = $('body').hasClass('dm');
		var fieldset = $('#enemy-health-fieldset');
		if (isEnemy && isDungeonMaster) {
			fieldset.show();
		} else {
			fieldset.hide();
		}
	};

var getRowSpanForEnemyInDMView = function(charID) {
		return SubCharacterList.find({
			charID: charID
		}).count() + 1;
	};

var getAllPartyBuffs = function() {
		var allCharInGame = CharacterList.find({char_in_game:true});
		var ids = new Array();
		allCharInGame.forEach(function(character){
			ids.push(character._id);
		});
		return PartyBuffList.find({charID: {$in:ids}});
	};

var adjustRowSpans = function() {
		$('table .enemy-true .char-name').each(function() {
			var cell = $(this);
			var charID = cell.parent().attr('data-char-id');
			var rowspan = getRowSpanForEnemyInDMView(charID);
			cell.attr('rowspan', rowspan);
		});
	};

var getLatestScratchPadContent = function() {
		if (ScratchPadList.find().count() < 1) {
			return "";
		}
		return ScratchPadList.findOne({}, {sort: {time: -1}}).content;
	};
	
var saveScratchPad = function(body) {
		var time = new Date();
		var revisionLimit = 10;
		var numRevisions = ScratchPadList.find().count();
		while (numRevisions >= revisionLimit) {
			var oldest = ScratchPadList.findOne({}, {sort: {time: 1}});
			ScratchPadList.remove({_id: oldest._id});
			numRevisions = ScratchPadList.find().count();
		}
		ScratchPadList.insert({
			time: time,
			content: body.html()
		});
		var saveIndicator = $('#scratch-pad-save-indicator');
		saveIndicator.fadeIn();
		setTimeout(function() {
			saveIndicator.fadeOut();
		}, 1000);
	};
	
var elrteBottomTabHeight = 52;
var setupScratchPadRevisionsTab = function() {
		var characterListHeight = $('#character-list-span').height();
		var revisionTab = $('#scratch-pad-revisions-tab');
		var tabs = $('#scratch-pad-span .nav-tabs');
		var height = characterListHeight - tabs.outerHeight() - elrteBottomTabHeight;
		revisionTab.css('height', height + 'px');
	};
	
var setupScratchPad = function() {
		if (!$('body').hasClass('dm')) {
			return;
		}
		setupScratchPadRevisionsTab();
		var textarea = $('#scratch-pad');
		var container = textarea.parent();
		textarea.css('width', container.innerWidth() + 'px');
		var tabs = $('#scratch-pad-span .nav-tabs');
		var characterListHeight = $('#character-list-span').height();
		var height = characterListHeight - textarea.offset().top - tabs.height() - elrteBottomTabHeight;
		textarea.css('height', height + 'px');
		elRTE.prototype.options.panels.dndPanel = [
			'bold', 'italic', 'underline', 'strikethrough'
		];
		elRTE.prototype.options.toolbars.dndToolbar = ['dndPanel', 'lists', 'undoredo'];
		textarea.val(getLatestScratchPadContent());
		textarea.elrte({
			toolbar: 'dndToolbar',
			height: height,
			resizable: false
		});
		var timeout = null;
		var editBody = $($('#dashboard-span .el-rte .workzone iframe')[0].contentDocument.body);
		editBody.keypress(function() {
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				saveScratchPad(editBody);
			}, 4000);
		});
	};
	
var adjustDMColumns = function() {
		if ($('body').hasClass('dm')) {
			$('#character-list-span').removeClass('span12').addClass('span9');
		} else {
			$('#character-list-span').removeClass('span9').addClass('span12');
		}
	};

Template.footer.events = {
	'click a[href=#dm]': function(event) {
		event.preventDefault();
		var body = $('body');
		var link = $(event.currentTarget);
		if (body.hasClass('dm')) {
			body.removeClass('dm');
			link.text('Dungeon Master view');
		} else if (confirm("Are you sure you want to turn on Dungeon Master view?")) {
			body.addClass('dm');
			link.text('Regular player view');
		}
		showEnemyHealthFieldsetIfNecessary();
		adjustRowSpans();
		adjustDMColumns();
		setupScratchPad();
	},
	'click a[href=#export]': function(event){
		Meteor.call("export_db", function(error) {
        	console.debug("error", error);
    	});

	}
};

Template.dashboard.events = {
	'click a[href=#remove-buff]': function() {
		if (confirm("Are you sure you want to remove this buff?")) {
			PartyBuffList.remove({_id: this._id});
		}
		return false;
	}
};

Template.dashboard.getBuffSource = function() {
	var character = CharacterList.findOne({
		_id: this.charID
	});
	return character.name
};

Template.dashboard.scratchPadRevisions = function() {
	return ScratchPadList.find({
	}, {
		sort: {
			time: -1
		}
	});
};

Template.scratch_pad_revision.prettyDate = function() {
	var time = new Date(this.time);
	var year = time.getFullYear();
	var month = time.getMonth() + 1;
	var day = time.getDate();
	return year + "/" + month + "/" + day;
};

Template.scratch_pad_revision.prettyTime = function() {
	var time = new Date(this.time);
	var hour = time.getHours();
	var minute = time.getMinutes();
	minute = minute < 10 ? '0' + minute : minute;
	var amPM = hour > 12 ? "PM" : "AM";
	hour = hour > 12 ? hour - 12 : hour;
	hour = 0 == hour ? 12 : hour;
	return hour + ":" + minute + " " + amPM;
};

Template.character_status_effects.hasEffect = function(effect) {
	return $.inArray(effect, this.effects || []) > -1;
};

Template.scratch_pad_revision.events = {
	'click a[href=#restore]': function(event) {
		if (!confirm("Are you sure you want to restore this revision?")) {
			return false;
		}
		var content = this.content;
		var editBody = $($('#scratch-pad-span .el-rte .workzone iframe')[0].contentDocument.body);
		editBody.html(content);
		ScratchPadList.update({
			_id: this._id
		}, {
			$set: {
				time: new Date()
			}
		});
		$('a[href=#scratch-pad-tab]').click();
		return false;
	},
	'click a[href=#delete]': function(event) {
		if (!confirm("Are you sure you want to delete this revision, Big Brother?")) {
			return false;
		}
		ScratchPadList.remove({_id: this._id});
		return false;
	}
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

var resetCharacterForm = function() {
		$('#new-enemy').attr('checked', true);
		$("#char-ac").val('');
		$("#char-fort").val('');
		$("#char-ref").val('');
		$("#char-will").val('');
		$("#char-dmg").val('');
		$('#character-id').val('');
		$('#enemy-hp').val('');
		$('#enemy-max-hp').val('');
		$('#new-initiative').val('');
		$('#new-character').val('');
		$('.navbar .control-group.error').removeClass('error');
	};

Template.navbar.events = {
	'change #new-enemy': function() {
		showEnemyHealthFieldsetIfNecessary();
	},
	'click #add-button': function() {
		var id = $('#character-id').val();
		var character = CharacterList.findOne({
			_id: id
		});
		var nameField = $("#new-character");
		var name = nameField.val();
		if (!fieldHasValue(nameField)) {
			return false;
		}
		var isEnemy = $('#new-enemy').is(':checked');
		var initiativeVal = parseInt($("#new-initiative").val(), 10);
		var charAc = parseInt($("#char-ac").val(), 10);
		var charFort = parseInt($("#char-fort").val(), 10);
		var charRef = parseInt($("#char-ref").val(), 10);
		var charWill = parseInt($("#char-will").val(), 10);
		var damage = parseInt($("#char-dmg").val(), 10);
		var enemyHPRaw = $('#enemy-hp').val();
		var maxEnemyHPRaw = $('#enemy-max-hp').val();
		var currentHP = isEnemy && $.trim(enemyHPRaw) != '' ? parseInt(enemyHPRaw, 10) : 1;
		var maxHP = isEnemy && $.trim(maxEnemyHPRaw) != '' ? parseInt(maxEnemyHPRaw, 10) : 1;
		if (null == character) {
			var charProps = {
				name: name,
				initiative: initiativeVal,
				active: false,
				isEnemy: isEnemy,
				char_in_game: true,
				char_ac: charAc,
				char_fort: charFort,
				char_ref: charRef,
				char_will: charWill,
				currentHP: currentHP,
				maxHP: maxHP,
				damage: damage,
				effects: []
			};
			var newCharID = CharacterList.insert(charProps);
			if (isEnemy) {
				addNewSubEnemy(newCharID, charProps);
			}
		} else {
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
					currentHP: currentHP,
					maxHP: maxHP
				}
			});
			if (isEnemy) {
				SubCharacterList.update({
					charID: id
				}, {
					$set: {
						maxHP: maxHP
					}
				}, {
					multi: true
				});
			}
		}
		resetCharacterForm();
		return false;
	},
	'click #reset-button': function() {
		resetCharacterForm();
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


Template.character.partyBuffs = function() {
	return PartyBuffList.find({charID: this._id});
};

Template.dashboard.allPartyBuffs = function() {
	return getAllPartyBuffs();
};

var getSubCharactersByID = function(charID) {
		return SubCharacterList.find({
			charID: charID
		}, {
			sort: {
				name: 1
			}
		});
	};
	
Template.sub_enemy_row.numSubEnemies = function() {
	return getSubCharactersByID(this.charID).count();
};

Template.sub_enemy_row.isFirst = function() {
	var subEnemies = getSubCharactersByID(this.charID).fetch();
	return subEnemies[0]._id == this._id;
};

Template.sub_enemy_row.active = function() {
	return CharacterList.findOne({_id: this.charID}).active;
};

Template.sub_enemy_row.isBloodied = function() {
	return this.currentHP <= (this.maxHP / 2);
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
	showEnemyHealthFieldsetIfNecessary();
	if (character.isEnemy) {
		$('#enemy-hp').removeAttr('disabled').val(character.currentHP);
		$('#enemy-max-hp').removeAttr('disabled').val(character.maxHP);
	} else {
		$('#enemy-hp, #enemy-max-hp').attr('disabled', 'disabled');
	}
	$('#character-id').val(character._id);
	$('html, body').animate({scrollTop: 0}, 500);
};

Template.character.rowSpan = function() {
	if (this.isEnemy) {
		if ($('body').hasClass('dm')) {
			return getRowSpanForEnemyInDMView(this._id);
		}
		return 1;
	}
	return 2;
};

Template.character.subEnemies = function() {
	return getSubCharactersByID(this._id);
};

Template.sub_enemy_row.events = {
	'click a[href=#delete-sub-enemy]': function() {
		if (confirm("Are you sure you want to delete enemy " + this.name + "?")) {
			SubCharacterList.remove(this._id);
		}
		return false;
	},
	'click .sub-enemy-name': function(event) {
		var span = $(event.currentTarget);
		span.hide();
		var form = span.next('.sub-enemy-name-form');
		form.show();
		var input = $('#sub-enemy-name', form);
		var name = $.trim(span.text());
		input.val(name);
		input.focus();
		var button = $('#sub-enemy-save', form);
		var id = this._id;
		var updateSubEnemyName = function() {
			name = $.trim(input.val());
			if (name == '') {
				input.addClass('error');
				return false;
			}
			input.removeClass('error');
			SubCharacterList.update({
				_id: id
			}, {
				$set: {
					name: name
				}
			});
			form.hide();
			span.text(name).show();
			return false;
		};
		button.click(updateSubEnemyName);
		input.keypress(function(e) {
			if (e.which == 13) { // Enter
				return updateSubEnemyName();
			}
		});
	},
	'click a[href=#create-new]': function(event) {
		var link = $(event.currentTarget);
		var charID = this.charID;
		var subCharCount = link.closest('tbody').children('tr[data-char-id=' + charID + ']').length;
		var name = this.name;
		var namePrefix;
		if (name.indexOf(' ') > -1) {
			namePrefix = name.split(' ')[0];
		} else if (name.indexOf('#') > -1) {
			namePrefix = name.split('#')[0];
		} else {
			namePrefix = name;
		}
		SubCharacterList.insert({
			charID: charID,
			name: namePrefix + ' #' + (subCharCount + 1),
			currentHP: this.maxHP,
			maxHP: this.maxHP,
			isEnemy: true
		});
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
		var input = $('<input type="number" class="current-hp-edit">');
		input.val(currentHP);
		currentHPSpan.html(input);
		input.focus();
		var enemy = this;
		var updateCurrentHP = function() {
			var newHPRaw = input.val();
			if ($.trim(newHPRaw) != '') {
				var newHP = parseInt(newHPRaw, 10);
				SubCharacterList.update({
					_id: enemy._id
				}, {
					$set: {
						currentHP: newHP
					}
				});
			}
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

Template.character.events = {
	'click .delete': function() {
		if (confirm("Are you sure you want to delete character " + this.name + "?")) {
			var charID = this._id;
			CharacterList.remove(charID);
			SubCharacterList.remove({charID: charID});
			PartyBuffList.remove({charID: charID});
		}
		return false;
	},
	'click .char-name': function() {
		editCharacter(this);
	},
	'click a[href=#retire]': function() {
		CharacterList.update({
			_id: this._id
		}, {
			$set: {
				char_in_game: false
			}
		});
		return false;
	},
	'click a[href=#create-new-buff]': function(event) {
		var link = $(event.currentTarget);
		var charID = this.charID;
		var name = this.name;
		PartyBuffList.insert({
			charID: this._id,
			name: "New Buff"
		});
		return false;
	},
	'click a[href=#show-all-buffs]': function(event) {
		event.preventDefault();
		var link = $(event.currentTarget);
		var icon = $('i', link);
		var row = link.closest('td.char-buffs');
		if (icon.hasClass('icon-chevron-right')) {
			icon.removeClass('icon-chevron-right').addClass('icon-chevron-down');
			$('.control-group.infrequent', row).fadeIn().css("display","inline-block");
		} else {
			icon.removeClass('icon-chevron-down').addClass('icon-chevron-right');
			$('.control-group.infrequent:not(.checked)', row).fadeOut();
		}
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
			PartyBuffList.remove({charID: this._id});
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

Template.char_buff_row.events = {
	'click .char-buff': function(event) {
		var charBuffSpan = $(event.currentTarget);
		if (charBuffSpan.hasClass('editing')) {
			return;
		}
		charBuffSpan.addClass('editing');
		var buffNameSpan = $('.name', charBuffSpan);
		var buffDelete = $('.delete', charBuffSpan.parent());
		buffDelete.css("display","inline-block");
		var buffNameText = buffNameSpan.text();
		var input = $('<input type="text" class="current-buff-edit">');
		input.val(buffNameText);
		buffNameSpan.html(input);
		input.focus();
		var enemy = this;
		var updateBuf = function() {
			var newBuffName = input.val();
			if ($.trim(newBuffName) != '') {			
				PartyBuffList.update({
					_id: buffNameSpan.attr("id")
				}, {
					$set: {
						name: newBuffName
					}
				});
			}
			input.remove();
			buffNameSpan.text(newBuffName);
			charBuffSpan.removeClass('editing');
		};
		input.keypress(function(e) {
		    if (e.which == 13) { // Enter
				updateBuf();
			}
		});
		input.blur(updateBuf);
	},
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
	var nextCharCodes = [32, 39, 40];
	if ($.inArray(evt.keyCode, nextCharCodes) > -1) {
		evt.preventDefault();
		nextCharacter();
	}
});
