'use strict';

var Memo = function (container) {
	if (!(this instanceof Memo)) {
		return new Memo(container);
	}
	this.container = container;
	this.init();
	this.start(10);
};

Memo.prototype.icons = [
	'anchor', 'automobile', 'balance-scale', 'bell',
	'bed', 'bicycle', 'bomb', 'camera', 'child',
	'cloud', 'cube', 'diamond', 'eye', 'envelope',
	'gift', 'glass', 'heart', 'leaf', 'paw', 'plus',
	'recycle', 'rocket', 'ship', 'smile-o'
];

Memo.prototype.init = function () {
	this.container.innerHTML = '';
	this.game = document.createElement('div');
	this.game.className = 'game';

	this.timerElement = document.createElement('div');
	this.timerElement.className = 'timer';
	this.timerElement.innerHTML = '0:00';

	this.container.appendChild(this.game);
	this.container.appendChild(this.timerElement);
	this.clickEnabled = true;
	this.reset();
};

Memo.prototype.reset = function () {
	this.game.innerHTML = '';
	this.timerElement.innerHTML = '0:00';
	this.time = 0;
	this.clicks = 0;
	clearInterval(this.timer);
};

Memo.prototype.initGame = function () {
	this.reset();
	var self = this;
	var c = [];
	var sets = this.sets;
	while (sets) {
		for (var s = 0; s < this.setSize; s++) {
			c.push(sets);
		}
		sets--;
	}
	c = shuffle(c);
	var icons = shuffle(this.icons);

	var cardClick = function () {
		if (Utils.hasClass(this, 'matched') || Utils.hasClass(this, 'flipped') || !self.clickEnabled) {
			return;
		}
		self.clicks++;
		Utils.addClass(this, 'flipped');
		self.check();
	};

	for (var i = 0; i < c.length; i++) {
		var card = document.createElement('div');
		card.setAttribute('data-value', c[i]);
		Utils.addClass(card, 'card');
		card.addEventListener('click', cardClick);

		var front = document.createElement('figure');
		front.className = 'front';
		card.appendChild(front);

		var back = document.createElement('figure');
		back.className = 'back';

		var icon = document.createElement('i');
		icon.className = 'fa fa-' + icons[c[i]];

		var desc = document.createElement('div');
		desc.innerHTML = c[i];
		back.appendChild(icon);
		back.appendChild(desc);

		card.appendChild(back);

		this.game.appendChild(card);
	}
};

Memo.prototype.start = function (sets, setSize) {
	var self = this;
	this.setSize = parseInt(setSize) ? parseInt(setSize) : 2;
	this.sets = sets;
	this.initGame(sets);
	this.timer = setInterval(function () {
		self.time++;
		self.timerElement.innerHTML = ("" + Math.floor(self.time / 60) + ':' + lPad('0', 2, "" + (self.time % 60)))
	}, 1000);
};

Memo.prototype.check = function () {
	var self = this;
	var flipped = Utils.htmlCollectionArray(this.game.getElementsByClassName('flipped'));
	if (flipped.length > 1) {
		var value = flipped[0].getAttribute('data-value');
		var match = flipped.every(function (e) {
			return value === e.getAttribute('data-value')
		});
		if (match && flipped.length == this.setSize) {
			flipped.map(function (e) {
				Utils.addClass(e, 'matched')
			});
			flipped.map(function (e) {
				Utils.removeClass(e, 'flipped')
			});
		} else if (!match) {
			this.clickEnabled = false;
			setTimeout(function () {
				flipped.map(function (e) {
					Utils.removeClass(e, 'flipped')
				});
				self.clickEnabled = true
			}, 1000);
		}
		if (this.game.getElementsByClassName('matched').length == this.game.getElementsByClassName('card').length) {
			clearInterval(this.timer);
			self.timerElement.innerHTML = ("You matched all cards in " + Math.floor(self.time / 60) + ':' + lPad('0', 2, "" + (self.time % 60)) + " with " + this.clicks + " clicks");
		}
	}
};

var Utils = {
	hasClass: function (element, cls) {
		return -1 !== element.className.split(" ").indexOf(cls);
	},
	addClass: function (element, cls) {
		if (!this.hasClass(element, cls)) {
			element.className = (element.className + " " + cls).trim();
		}
	},
	removeClass: function (element, cls) {
		element.className = element.className.split(" ").filter(function (e) {
			return e != cls
		}).join(" ");
	},
	htmlCollectionArray: function (c) {
		var a = [];
		for (var i = 0; i < c.length; i++) {
			a.push(c[i]);
		}
		return a;
	}
};

//http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function lPad(padString, length, str) {
	while (str.length < length)
		str = padString + str;
	return str;
}

window.addEventListener('load', function () {
	var game = function () {
		Memo(document.getElementById('game')).start(
			document.getElementById('sets').value,
			document.getElementById('setSize').value);
	};
	game();
	document.getElementById('start').addEventListener('click', game);
});