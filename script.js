/**
 *   Created by: Yuri Borovik
 *   Email: yuri.borovik@gmail.com
 *   Date: 22.04.2016
 *   Time: 16:16
 *
 */
(function () {
	'use strict';
	// DESCRIPTION APP: HELPERS
	/**
	 *
	 * @param what
	 * @returns {boolean}
	 */
	function isDefined(what) {
		return (what !== undefined && what !== null);
	}

	/**
	 *
	 * @param array
	 * @returns int length
	 */
	function getLength(array) {
		return array.length;
	}

	/**
	 *
	 * @param array
	 * @param item
	 * @returns {boolean}
	 */
	function isItemInArray(array, item) {
		for (var i = 0; i < array.length; i++) {
			if (array[i][1] == item) {
				return true;
			}
		}
		return false;
	}

	Array.prototype.makeLines = function () {
		return this.split(/\r\n|\r|\n/);
	};
	String.prototype.makeLines = function () {
		return this.split(/\r\n|\r|\n/);
	};

	var View, Api;
	// DESCRIPTION APP: LOGIC
	Api = {
		files: [],
		filesContents: [],
		xmlhttp: function () {
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP");
				}
				catch (ee) {

				}

			}
			if (typeof XMLHttpRequest != 'undefined') {

				return new XMLHttpRequest();
			}
		},
		/**
		 *
		 * @param data  array
		 */
		diffHandler: function (data) {
			var original = [], changed = [], result = [], lines = 0, lines2 = 0;
			// DESCRIPTION APP: make lines from both files
			Api.filesContents[0].makeLines().forEach(function (fullLine) {
				lines++;
				original.push([lines, fullLine]);
			});
			data.makeLines().forEach(function (fullLine) {
				lines2++;
				changed.push([lines2, fullLine])
			});

			// DESCRIPTION APP: reset previous result
			result.length = 0;

			// DESCRIPTION APP: GET LONGEST FILE
			var length = (getLength(original) < getLength(changed)) ? getLength(changed) : getLength(original);
			// DESCRIPTION APP: MAKE FILES LENGTH EQUAL
			if (getLength(original) < getLength(changed)) {
				for (var i = getLength(original); i < getLength(changed); i++) {
					original.push([]);
				}
			}
			else {
				for (var i = getLength(changed); i < getLength(original); i++) {
					changed.push([]);
				}
			}

			// DESCRIPTION APP: begin to diff files
			for (var i = 0; i < length; i++) {
				// DESCRIPTION APP: check first line changes
				if (i < 1) {
					if (original[i][1] == changed[i][1]) {
						// DESCRIPTION APP: Nothing if line has not changed
						result.push([original[i][0], '', original[i][1]])
					} else {
						// DESCRIPTION APP: in case if line has changed
						result.push([original[i][0], '*', original[i][1] + ' | ' + changed[i][1]])
					}
				}
				else {

					// DESCRIPTION APP: check if item is in second file
					if (isItemInArray(changed, original[i][1])) {
						result.push([changed[i][0], '', original[i][1]]);
					}
					else {
						if (original[i][1] !== undefined) {
							result.push([original[i][0], '-', original[i][1]]);
						}
					}
					// DESCRIPTION APP: check if item is in first file
					if (!isItemInArray(original, changed[i][1]) && changed[i][1] !== undefined) {
						result.push([changed[i][0], '+', changed[i][1]]);
					}
				}

			}
			// DESCRIPTION APP: render results
			View.renderDiffData(result);
		},
		/**
		 *
		 * @param data array
		 */
		diffInit: function (data) {
			var res = [], lines = 0;

			data.makeLines().forEach(function (fullLine) {
				lines++;
				res.push([lines, fullLine]);
			});
			View.renderContent(res);
			Api.diffHandler(data);
		},

		getFileContent: function () {
			var url = document.querySelector('.text-field_input').value;

			Api.files.push(url);

			var xmlhttp = Api.xmlhttp();
			xmlhttp.onreadystatechange = function () {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					var data = xmlhttp.responseText;
					Api.filesContents.push('' + data + '');
					Api.diffInit(data);
					View.toggleFileInputContainer();
				}
			};
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
		}
	};
	// DESCRIPTION APP: VIEW
	View = {
		container: document.getElementById('main'),
		/**
		 *
		 * @param element  to create
		 * @param parent to append to
		 */
		createElement: function (element, parent) {

			if (isDefined(element.classes)) {
				var i = 0, length = element.classes.length;
				for (i; i < length; i++) {
					element.node.classList.add(element.classes[i]);
				}
			}
			if (isDefined(element.id)) {
				element.node.id = element.id;
			}
			if (isDefined(element.type)) {
				element.node.type = element.type;
			}
			if (isDefined(element.value)) {
				element.node.value = element.value;
			}
			if (isDefined(element.html)) {
				element.node.innerHTML = element.html;
			}
			if (isDefined(element.text)) {
				element.node.innerText = element.text;
			}

			if (isDefined(element.events)) {
				var e = 0, length = element.events.length;
				for (e; e < length; e++) {
					element.node.addEventListener(element.events[e].type, element.events[e].action);
				}

			}
			if (!isDefined(parent)) {
				View.container.appendChild(element.node);
			}
			else {
				if (isDefined(element.node)) {
					parent.appendChild(element.node);
				}
			}

		},
		ui: function () {

			if (View.container == undefined) {
				var alert = document.createElement('h1');
				alert.innerText = 'Add container first!';
				document.body.appendChild(alert);
				return false;
			}

			var changeLabelPosition = function () {
				var label = document.querySelector('.text-field_label');
				var element = document.querySelector('.text-field_input');
				if (!label.classList.contains('is--active')) {
					label.classList.add('is--active');
				}
				else if (element.value.length === 0) {
					label.classList.remove('is--active');
				}

			};
			var setStylesAndFonts = function () {
				var styles = [{
					type: 'text/css',
					rel: 'stylesheet',
					href: 'styles.css'
				}];
				var fonts = [{
					type: 'text/css',
					rel: 'stylesheet',
					href: 'http://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
				}];
				var s = 0, f = 0, head = document.head;

				for (s; s < styles.length; s++) {
					var link = document.createElement('link');
					var style = styles[f];
					link.type = style.type;
					link.rel = style.rel;
					link.href = style.href;

					head.appendChild(link);
				}

				for (f; f < fonts.length; f++) {
					var link = document.createElement('link');
					var font = fonts[f];
					link.type = font.type;
					link.rel = font.rel;
					link.href = font.href;

					head.appendChild(link);
				}
			}
			var toolbar = {
				node: document.createElement('nav'),
				classes: ['toolbar'],
				html: '<h1>FileDiff</h1>'
			};
			var subToolbar = {
				node: document.createElement('div'),
				classes: ['sub-toolbar']
			};
			var inputContainer = {
				node: document.createElement('div'),
				classes: ['file-input-container']
			};
			var textField = {
				node: document.createElement('div'),
				classes: ['text-field']
			};
			var textLabel = {
				node: document.createElement('label'),
				classes: ['text-field_label'],
				text: 'File:'
			};
			var textInput = {
				node: document.createElement('input'),
				type: 'text',
				classes: ['text-field_input'],
				value: 'data/file1.txt',
				events: [{
					type: 'change',
					action: changeLabelPosition
				}, {
					type: 'keypress',
					action: changeLabelPosition
				}]
			};
			var addButton = {
				node: document.createElement('button'),
				text: 'Add reference file',
				classes: ['text-field_button'],
				events: [{
					type: 'click',
					action: Api.getFileContent
				}]
			};
			var filesContainer = {
				node: document.createElement('div'),
				classes: ['files-container']
			}
			var filesDiffContainer = {
				node: document.createElement('div'),
				classes: ['files-diff-container']
			}
			var diffTable = {
				node: document.createElement('table'),
				id: 'diffTable'
			}
			var tryButton = {
				node: document.createElement('button'),
				text: 'Try new file',
				classes: ['try-button','hidden'],
				events: [{
					type: 'click',
					action: View.toggleFileInputContainer
				}]
			};
			View.createElement(toolbar);
			View.createElement(subToolbar);
			View.createElement(inputContainer, subToolbar.node);
			View.createElement(textField, inputContainer.node);
			View.createElement(textLabel, textField.node);
			View.createElement(textInput, textField.node);
			View.createElement(addButton, inputContainer.node);
			View.createElement(filesContainer);
			View.createElement(filesDiffContainer);
			View.createElement(diffTable, filesDiffContainer.node);
			View.createElement(tryButton,subToolbar.node);
			changeLabelPosition();
			setStylesAndFonts();

		},
		/**
		 *
		 * @param data multidimensional array
		 */
		renderContent: function (data) {
			var table, tr, td, tn, row, col;
			var filesContainer = document.querySelector('.files-container');
			var container = document.createElement('div');
			if (filesContainer.childNodes.length > 1) {
				filesContainer.removeChild(filesContainer.lastElementChild);
			}

			container.classList.add('file-container');
			filesContainer.appendChild(container);
			table = document.createElement('table');
			container.appendChild(table);
			for (row = 0; row < data.length; row++) {
				tr = document.createElement('tr');

				for (col = 0; col < data[row].length; col++) {
					td = document.createElement('td');
					tn = document.createTextNode(data[row][col]);
					td.appendChild(tn);
					tr.appendChild(td);
				}
				table.appendChild(tr);
			}

		},
		/**
		 *
		 * @param data multidimensional array
		 */
		renderDiffData: function (data) {
			var tr, td, tn, row, col, actionClass;

			// DESCRIPTION APP: reset diff table
			document.getElementById('diffTable').innerHTML = "";
			// DESCRIPTION APP: create rows and columns based on data
			for (row = 0; row < data.length; row++) {
				tr = document.createElement('tr');

				for (col = 0; col < data[row].length; col++) {
					td = document.createElement('td');
					switch (data[row][1]) {
						case '':
							actionClass = 'default';
							break;
						case '*':
							actionClass = 'changed';
							break;
						case '-':
							actionClass = 'deleted';
							break;
						case '+':
							actionClass = 'added';
							break;

					}
					if (col == 2) {
						td.classList.add(actionClass);
					}

					tn = document.createTextNode(data[row][col]);
					td.appendChild(tn);
					tr.appendChild(td);
				}
				document.getElementById('diffTable').appendChild(tr);
			}
		},
		toggleFileInputContainer: function () {
			var fileInputContainer = document.querySelector('.file-input-container');
			var button = document.querySelector('.text-field_button');
			var tryButton = document.querySelector('.try-button');

			// DESCRIPTION APP: check if container is hidden
			if (fileInputContainer.classList.contains('hidden')) {
				// DESCRIPTION APP: reset files number
				Api.files.length = 0;
				// DESCRIPTION APP: show contianer
				fileInputContainer.classList.remove('hidden');
				// DESCRIPTION APP: hide try again button
				tryButton.classList.add('hidden');
			}
			else {
				// DESCRIPTION APP: check number of files
				if (Api.files.length == 1) {
					// DESCRIPTION APP: change button text
					button.innerText = 'Add modified file';
				}
				else if (Api.files.length == 2) {
					// DESCRIPTION APP: hide container
					fileInputContainer.classList.add('hidden');
					// DESCRIPTION APP: show try again button
					tryButton.classList.remove('hidden');
					// DESCRIPTION APP: reset button text to default
					button.innerText = 'Add reference file';
				}
			}

		}
	};
	// DESCRIPTION APP: START COMPONENT
	window.addEventListener('DOMContentLoaded', View.ui);
})
();
