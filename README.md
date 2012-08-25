# Dungeons and Dragons Leaderboard

## What is this?

When our Dungeons and Dragons group got together, we found ourselves scribbling everyone's initiative and name on a markerboard so we could keep track of whose turn it was.  This project is designed to make that process smoother, and display some other useful info to players during the game.  What our group does is one person starts this app on their laptop (we've just tried it on Macs so far), our DM points his browser at the server URL (e.g., 192.168.1.215:3000), and we have one other screen that the players can see pointing at the app.  You could probably just use two screens, one being the server for the players to see, the other being the DM's view.

## How does it work?

This app uses [Meteor](http://meteor.com/) to display a view that's shared across all screens.  That means that when the DM taps the space bar on his computer because Ted the Destroyer's turn is over, the second screen that the players are watching updates and shows that Ted's turn is over.

## Screenshots

View for regular players:

![Dungeons and Dragons Leaderboard in Chrome](https://raw.github.com/joekr/D-D-Leaderboard/master/screenshot-1.png "Viewed in Chrome")

View for the Dungeon Master:

![Dungeons and Dragons Leaderboard in Chrome](https://raw.github.com/joekr/D-D-Leaderboard/master/screenshot-2.png "Dungeon Master view in Chrome")

See [Handlebars](http://handlebarsjs.com/) for the template system.  See also [Meteor documentation](http://docs.meteor.com/). A good write up on Meteor [Fundamentals and Best Practices](http://andrewscala.com/meteor/)

## Install Meteor
    $ curl install.meteor.com | /bin/sh

## Starting the Server
Go to the directory where you cloned this git repository, and run:

    $ meteor -d
	[[[[[ ~/programming/D-D-Leaderboard ]]]]]

	Running on: http://localhost:3000/
	...

Access `http://localhost:3000` in your browser and you're off!

## How to Use

Add new characters to the game using the form up top.  Our team uses an average damage score for each player when we're trying to play quick games, so we don't have to roll every at-will attack's damage--feel free to not use that field.  For enemies, the AC, Fort, Ref, and Will don't show up, so you can leave them blank.

Once you have a few characters on the board, you can hit Space/Down Arrow/Right Arrow to mark a character as active, meaning it's their turn.  Tap again to proceed to the character with the next highest initiative.

If a person couldn't make it to the game that day, use the button on the right with the down arrow to move them to the Out of the Game list.  Their stats will be preserved, and you can move them back into the list of current players when they join you again.

Click a character's name to edit their stats/name.

DMs, click the 'Dungeon Master view' link at the bottom to view stuff specifically for you.  This should only be shown on a screen that you can see, not others.  This separate view is a work in progress.