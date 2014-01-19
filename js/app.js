Array.prototype.each = function(func) {
	for(var i = 0, length = this.length; i < length; i++) {
		func(i, this[i]);
	}
}
NodeList.prototype.each = function(func) {
	for(var i = 0, length = this.length; i < length; i++) {
		func(i, this[i]);
	}
}
String.prototype.contains = function(str) {
	if(this.indexOf(str) != -1) {
		return true;
	}
	return false;
}

var app = (function() {
	var URL = 'http://localhost/chart/';
	var CHART_PREFIX = 'chart-';
	var ITEM_PREFIX = 'item-';
	var ICON_PREFIX = 'icon-';

	/*Mediator pattern*/
	var mediator = (function(){
	    var subscribe = function(channel, fn){
	        if (!mediator.channels[channel]) mediator.channels[channel] = [];
	        mediator.channels[channel].push({context: this, callback: fn});
	        return this;
	    };
	 
	    var publish = function(channel) {
	        if (!mediator.channels[channel]) return false;
	        var args = Array.prototype.slice.call(arguments, 1);
	        for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
	            var subscription = mediator.channels[channel][i];
	            subscription.callback.apply(subscription.context, args);
	        }
	        return this;
	    };
	 	
	 	var removeSubscribers = function(channel) {
	 		mediator.channels[channel] = [];
	 	};

	    return {
	        channels: {},
	        publish: publish,
	        subscribe: subscribe,
	        removeSubscribers: removeSubscribers,
	        installTo: function(obj){
	            obj.subscribe = subscribe;
	            obj.publish = publish;
	        }
	    };
	 
	}());
	
	/*-----------------------------Class declaration--------------------------*/

	/*Chart class*/
	function Chart(options) {
		this.items = [];
		this.view = document.createElement('div');
		this.view.className = "chart";
		this.view.style.width = (options != undefined && options.width) ? options.width + 'px' : '600px';
		this.view.style.height = (options != undefined && options.height) ? options.height + 'px' : '400px';
		this.view.style.backgroundColor = '#FFF';
	}
	Chart.prototype.addItem = function(item) {
		this.items.push(item);
		this.view.appendChild(item.view);
	};
	Chart.prototype.removeItem = function(item) {
		this.items.each(function(index, value) {
			if(item == value) {
				this.items.splice(index, 1);
			}
		});
	}
	Chart.prototype.resize = function(size) {
		this.view.style.width = size.width + 'px';
		this.view.style.height = size.height + 'px';
	}

	/*ComparisonChart class*/
	function ComparisonChart(options) {
		Chart.call(this, options);
		this.title = new Text({
			text: 'Chart title here',
			font: 'bold italic 30px Georgia, serif',
			color: '#1b78c7',
			className: ' title'
		});
		this.subtitleA = new Text({
			y: 100,
			text: 'Subtitle A',
			font: 'bold italic 20px Georgia, serif',
			color: '#1b78c7',
			className: ' subtitle subtitle-a'
		});
		this.subtitleB = new Text({
			y: 400,
			text: 'Subtitle B',
			font: 'bold italic 20px Georgia, serif',
			color: '#1b78c7',
			className: ' subtitle subtitle-b'
		});
		this.iconA = new Icon({
			name: 'apple',
			color: '#F00'
		});
		this.iconB = new Icon({
			name: 'android',
			color: '#000000'
		});
		this.quantityA = (options != undefined && options.quantityA) ? options.quantityA : 3;
		this.quantityB = (options != undefined && options.quantityB) ? options.quantityB : 3;
		this.containerA = document.createElement('div');
		this.containerA.className = 'container-a';
		this.containerB = document.createElement('div');
		this.containerB.className = 'container-b';
		this.addItem(this.title);
		this.addItem(this.subtitleA);
		this.addItem(this.subtitleB);
		this.view.appendChild(this.containerA);
		this.view.appendChild(this.containerB);
		this.addClass(' comparison-chart');
		this.renderIcons();
		var that = this;
		this.view.onclick = function(e) {
			e.stopPropagation();
			mediator.publish('comparisonChartClicked', that);
		}
	}

	ComparisonChart.prototype = new Chart();

	ComparisonChart.prototype.renderIcons = function() {
		this.containerA.innerHTML = '';
		this.containerB.innerHTML = '';
		for(var i = 0; i < this.quantityA; i++) {
			this.containerA.innerHTML += this.iconA.view.outerHTML;
		}
		for(var i = 0; i < this.quantityB; i++) {
			this.containerB.innerHTML += this.iconB.view.outerHTML;
		}
	}

	ComparisonChart.prototype.getProperties = function() {
		return {
			title: this.title.getText(),
			subtitleA: this.subtitleA.getText(),
			subtitleB: this.subtitleB.getText(),
			iconA: this.iconA,
			iconB: this.iconB,
			quantityA: this.quantityA,
			quantityB: this.quantityB
		}
	}

	ComparisonChart.prototype.setProperties = function(properties) {
		// this.title.setText(properties.title);
		// this.subtitleA.setText(properties.subtitleA);
		// this.subtitleB.setText(properties.subtitleB);
		this.quantityA = properties.quantityA;
		this.quantityB = properties.quantityB;
		this.renderIcons();
	}

	ComparisonChart.prototype.addClass = function(className) {
		this.view.className += className;
	}


	/*Item base class*/
	function Item(options) {
		this.id = options.id || null;
		this.x = options.x || 0;
		this.y = options.y || 0;
	}

	/*Text class*/
	function Text(options) {
		Item.call(this, options);
		this.view = document.createElement('span');
		this.view.className = 'item item-text';
		this.text = '';
		if(options.text) {
			this.setText(options.text);
		}
		if(options.className) {
			this.view.className += options.className;
		}
		this.view.style.font = (options.font) ? options.font : '';
		this.view.style.color = (options.color) ? options.color : '';
		this.view.setAttribute('contenteditable', true);
	}

	Text.prototype.getText = function() {
		return this.view.textContent;
	}

	Text.prototype.setText = function(text) {
		this.text = text;
		this.view.textContent = text;
	}

	/*Icon class*/
	function Icon(options) {
		Item.call(this, options);
		this.name = options.name || 0;
		this.view = document.createElement('i');
		this.view.className = 'icon-' + this.name;
		this.view.style.color = options.color || '#888888';
	}

	Icon.prototype.getColor = function() {
		return this.view.style.color;
	}

	Icon.prototype.setColor = function(color) {
		this.view.style.color = color;
	}

	Icon.prototype.setIcon = function(icon) {
		this.view.className = 'icon-' + icon;
	}

	Icon.prototype.getClass = function() {
		return this.view.className;
	}

	Icon.prototype.setClass = function(className) {
		this.view.className = className;
	}

	/*-----------------------------Module declaration--------------------------*/

	/*Properties module*/
	var Properties = (function() {
		var view = {
			palette: document.querySelector('#properties-palette .box-content'),
			table: document.getElementById('properties-table'),
			heading: document.getElementById('properties-heading'),
			addRow: function(title, control) {
				var row = document.createElement('tr');
				var titleCell = document.createElement('td');
				titleCell.textContent = title;
				var controlCell = document.createElement('td');
				controlCell.appendChild(control);
				row.appendChild(titleCell);
				row.appendChild(controlCell);
				view.table.appendChild(row);
			},
			clear: function() {
				view.table.innerHTML = '';
				view.heading.innerHTML = '';
			},
			setHeading: function(str) {
				view.heading.textContent = str;
			}
		}

		var controller = {
			onComparisonChartClicked: function(obj) {
				var properties = obj.getProperties();
				console.log(properties);
				view.clear();
				view.setHeading('Comparison Chart');

				var quantityAInput = document.createElement('input');
				quantityAInput.value = properties.quantityA;
				quantityAInput.onkeyup = function() {
					properties.quantityA = quantityAInput.value;
					obj.setProperties(properties);
				}
				view.addRow('Quantity A:', quantityAInput);

				var quantityBInput = document.createElement('input');
				quantityBInput.value = properties.quantityB;
				quantityBInput.onkeyup = function() {
					properties.quantityB = quantityBInput.value;
					obj.setProperties(properties);
				}
				view.addRow('Quantity B:', quantityBInput);

				var colorAInput = document.createElement('div');
				colorAInput.className = 'color-btn';
				colorAInput.style.backgroundColor = properties.iconA.getColor();
				colorAInput.onclick = function() {
					mediator.publish('showColorPicker', this);
					mediator.subscribe('colorPicked', function(color) {
						properties.iconA.setColor(color);
						obj.setProperties(properties);
					})
				}
				view.addRow('Color A:', colorAInput);

				var colorBInput = document.createElement('div');
				colorBInput.className = 'color-btn';
				colorBInput.style.backgroundColor = properties.iconB.getColor();
				colorBInput.onclick = function() {
					mediator.publish('showColorPicker', this);
					mediator.subscribe('colorPicked', function(color) {
						properties.iconB.setColor(color);
						obj.setProperties(properties);
					})
				}
				view.addRow('Color B:', colorBInput);

				var iconAInput = document.createElement('i');
				iconAInput.className = properties.iconA.getClass();
				iconAInput.onclick = function() {
					mediator.publish('showIconPicker', this);
					mediator.subscribe('iconPicked', function(className) {
						properties.iconA.setClass(className);
						obj.setProperties(properties);
					})
				}
				view.addRow('Icon A:', iconAInput);

				var iconBInput = document.createElement('i');
				iconBInput.className = properties.iconB.getClass();
				iconBInput.onclick = function() {
					mediator.publish('showIconPicker', this);
					mediator.subscribe('iconPicked', function(className) {
						properties.iconB.setClass(className);
						obj.setProperties(properties);
					})
				}
				view.addRow('Icon B:', iconBInput);

			},
			onChartResizeRequest: function(size) {
				view.clear();
				view.setHeading('Canvas');
				var widthInput = document.createElement('input');
				widthInput.value = size.width;
				widthInput.onkeyup = function() {
					size.width = this.value;
					mediator.publish('chartSizeChanged', size);
				}
				view.addRow('Width:', widthInput);

				var heightInput = document.createElement('input');
				heightInput.value = size.height;
				heightInput.onkeyup = function() {
					size.height = this.value;
					mediator.publish('chartSizeChanged', size);
				}
				view.addRow('Height:', heightInput);
			},
			clearProperties: function() {
				view.clear();
			}

		}

		return {
			init: function() {
				mediator.subscribe('removeChartBtnClicked', controller.clearProperties);
				mediator.subscribe('chartResizeRequest', controller.onChartResizeRequest);				
				mediator.subscribe('comparisonChartClicked', controller.onComparisonChartClicked);
			},
			getProperties: controller.getProperties,
			onComparisonChartClicked: controller.onComparisonChartClicked
		}
	})();

	/*Menu module*/
	var Menu = (function() {
		var view = {
			chartSizeBtn: document.getElementById('chart-size-btn'),
			previewBtn: document.getElementById('preview-btn')
		};

		var controller = {

		};

		var model = {

		};

		function bindEvents() {
			view.chartSizeBtn.onclick = function(e) {
				e.preventDefault();
				mediator.publish('chartSizeBtnClicked');
			};
			view.previewBtn.onclick = function(e) {
				e.preventDefault();
				mediator.publish('previewBtnClicked');
			}
		}

		return {
			init: function() {
				bindEvents();
			}
		}
	})();

	/*Color Picker module*/
	var ColorPicker = (function() {
		var view = {
			palette: document.getElementById('color-palette'),
			canvas: document.getElementById('color-canvas'),
			ctx: document.getElementById('color-canvas').getContext('2d'),
			hide: function() {
				view.palette.style.display = 'none';
			},
			show: function() {
				view.palette.style.display = 'block';	
			}
		}

		var model = {
			context: {}
		}

		var controller = {
			onShowColorPicker: function(e) {
				model.context = e;
				view.show();
			}
		}

		function bindEvents() {
			view.canvas.onclick = function(e) {
				if(e.offsetX == undefined) {
					var x = e.layerX;
					var y = e.layerY - this.offsetTop;
				} else {					
					var x = parseInt(e.offsetX);
					var y = parseInt(e.offsetY);
				}
				//console.log(x);
				var imageData = view.ctx.getImageData(x, y, 1, 1);
				var r = imageData.data[0];
				var g = imageData.data[1];
				var b = imageData.data[2];
				var color = 'rgb(' + r + ',' + g + ',' + b + ')';				
				console.log(color);
				view.hide();
				model.context.style.backgroundColor = color;
				mediator.publish('colorPicked', color);
				mediator.removeSubscribers('colorPicked');
			}
			mediator.subscribe('showColorPicker', controller.onShowColorPicker);
		}

		return {
			init: function() {
				bindEvents();
				var colorMap = new Image();
				colorMap.src = 'img/colormap.gif';
				colorMap.onload = function() {
					var ctx = view.canvas.getContext('2d');
					ctx.fillRect(0,0,234,199);
					ctx.drawImage(this, 0, 0);
				}
			}
		}
	})();

	/*Icon picker module*/
	var IconPicker = (function() {
		var view = {
			palette: document.getElementById('icon-palette'),
			show: function() {
				view.palette.style.display = 'block';
			},
			hide: function() {
				view.palette.style.display = 'none';
			}
		}

		var model = {
			context: {}
		}

		var controller = {
			onShowIconPicker: function(e) {
				model.context = e;
				view.show();
			}
		}

		function bindEvents() {
			window.iconPicker = view.palette;
			var icons = view.palette.querySelectorAll('i');
			icons.each(function(index, icon) {
				icon.onclick = function() {
					view.hide();
					model.context.className = this.className;
					mediator.publish('iconPicked', this.className);
					mediator.removeSubscribers('iconPicked');
				}
			});	
		}

		return {
			init: function() {
				bindEvents();
				mediator.subscribe('showIconPicker', controller.onShowIconPicker);
			}
		}
	})();

	/*Editor module*/
	var Editor = (function() {
		var view = {
			editor: document.getElementById('editor'),
			container: document.getElementById('chart-container'),
			addChartBtn: document.getElementById('add-chart-btn'),
			removeChartBtn: document.getElementById('remove-chart-btn'),
			upBtn: document.getElementById('up-btn'),
			downBtn: document.getElementById('down-btn'),
			addChart: function(chart) {
				view.container.appendChild(chart.view);
			},
			removeActiveChart: function() {
				view.container.removeChild(model.activeChart.view);		
			},
			resize: function(size) {
				view.editor.style.width = size.width + 'px';
				view.editor.style.height = size.height + 'px';
			},
			setTop: function(px) {
				view.container.style.top = px + 'px';
				//console.log(top + 'px');
			},
			scrollUp: function(px) {
				var top = parseInt(view.container.style.top) || 0;
				view.container.style.top = (top - px) + 'px';
				//console.log(view.container.style.top);
			},
			scrollDown: function(px) {
				var top = parseInt(view.container.style.top) || 0;
				view.container.style.top = (top + px) + 'px';
				//console.log(view.container.style.top);
			}
		};

		var model = {
			chartId: 0,
			charts: [],
			activeChart: {},
			selectedItem: {},
			removeActiveChart: function() {
				model.charts.each(function(index, value) {
					if(value == model.activeChart && index < model.charts.length - 1) {
						model.charts.splice(index, 1);
						model.activeChart = model.charts[index];
					} else if (value == model.activeChart && index == model.charts.length - 1) {
						model.charts.splice(index, 1);
						model.activeChart = model.charts[index-1];
					}
				});
			},
			getIndexOfActiveChart: function() {
				var tmpIndex = -1;
				model.charts.each(function(index, value) {
					if(value == model.activeChart) {
						tmpIndex = index;
					}
				});
				return tmpIndex;
			}
		};

		var controller = {
			addChart: function() {			
				var chart = new Chart();

				model.charts.push(chart);
				view.addChart(chart);
				return chart;
			},
			addComparisonChart: function() {
				console.log(controller.getChartSize());
				var chart = new ComparisonChart(controller.getChartSize());
				if(model.charts.length == 0) {
					model.activeChart = chart;
				}
				model.charts.push(chart);
				view.addChart(chart);
				return chart;
			},
			removeActiveChart: function() {
				if(model.charts.indexOf(model.activeChart) == model.charts.length - 1) {
					view.scrollDown(controller.getChartSize().height);
				}
				view.removeActiveChart();
				model.removeActiveChart();
			},
			setActiveChart: function(chart) {
				model.activeChart = chart;
			},
			getActiveChart: function() {
				return model.activeChart;
			},
			onItemClicked: function(item) {
				model.selectedItem = item;
			},
			onChartSizeChaned: function(size) {
				view.resize(size);
				model.charts.each(function(index, chart) {
					chart.resize(size);
				});
				view.setTop(-model.getIndexOfActiveChart() * controller.getChartSize().height);
			},
			onUpBtnClicked: function() {
				if(model.charts.indexOf(model.activeChart) < model.charts.length - 1) {
					var currentChartIndex = model.charts.indexOf(model.activeChart);
					controller.setActiveChart(model.charts[currentChartIndex + 1]);
					view.scrollUp(controller.getChartSize().height);
				}
			},
			onDownBtnClicked: function() {
				if(model.charts.indexOf(model.activeChart) > 0) {
					var currentChartIndex = model.charts.indexOf(model.activeChart);
					controller.setActiveChart(model.charts[currentChartIndex - 1]);
					view.scrollDown(controller.getChartSize().height);
				}
			},
			getChartSize: function() {
				return {
					width: parseInt(view.editor.style.width),
					height: parseInt(view.editor.style.height)
				}
			},
			getCanvasSize: function() {
				return {
					width: parseInt(view.editor.style.width),
					height: parseInt(view.editor.style.height) * model.charts.length
				}
			},
			getContainer: function() {
				console.log(view.container);
				return view.container;
			}
		}

		function bindEvents() {
			view.addChartBtn.onclick = function(e) {
				e.stopPropagation();
				mediator.publish('addChartBtnClicked');
			};
			view.removeChartBtn.onclick = function(e) {
				e.stopPropagation();
				mediator.publish('removeChartBtnClicked');
			};
			view.upBtn.onclick = function(e) {
				e.stopPropagation();
				controller.onUpBtnClicked();
			};
			view.downBtn.onclick = function(e) {
				e.stopPropagation();
				controller.onDownBtnClicked();
			};
		}

		return {
			init: function() {
				view.editor.style.width = '600px';
				view.editor.style.height = '400px';
				mediator.subscribe('addChartBtnClicked', controller.addComparisonChart);
				bindEvents();
				mediator.publish('addChartBtnClicked');
				mediator.subscribe('removeChartBtnClicked', controller.removeActiveChart);
				mediator.subscribe('chartSizeChanged', controller.onChartSizeChaned);
			},
			getChartSize: controller.getChartSize,
			getCanvasSize: controller.getCanvasSize,
			getContainer: controller.getContainer
		}
	})();

	/*Previewer module*/
	var Previewer = (function() {
		var view = {
			previewer: document.getElementById('preview'),
			closeBtn: document.getElementById('close-preview-btn'),
			container: document.querySelector('#preview .container'),
			show: function() {
				view.previewer.style.display = 'block';
			},
			hide: function() {
				view.previewer.style.display = 'none';
			},
			setSize: function(dimension) {
				view.canvas.style.width = dimension.width + 'px';
				view.canvas.style.height = dimension.height + 'px';
			},
			clear: function() {
				view.container.innerHTML = '';
			}
		}

		var controller = {
			onPreviewBtnClicked: function() {
				controller.render();
				view.show();
			},
			render: function() {
				html2canvas(Editor.getContainer(), {
					height: Editor.getCanvasSize().height,
					onrendered: function(canvas) {
						view.container.appendChild(canvas);
						var imgURL = canvas.toDataURL('image/png');
						//Save image to server
						var ajax = new XMLHttpRequest();
						ajax.open('POST', 'saveImage.php', true);
						ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
						ajax.onreadystatechange = function() {
							if(ajax.readyState==4 && ajax.status==200) {
								console.log(ajax.responseText);
								imgURL = URL + ajax.responseText;
								var pinItBtn = document.createElement('a');
								var href = 'http://www.pinterest.com/pin/create/button/?url=' + encodeURIComponent('http://thietkeweb999.com') + '&media=' + encodeURIComponent(imgURL) + '&description=Test';
								pinItBtn.href = href;
								pinItBtn.setAttribute('data-pin-do', 'buttonPin');
								pinItBtn.setAttribute('data-pin-config', 'above');
								pinItBtn.innerHTML = '<img src="http://assets.pinterest.com/images/pidgets/pinit_fg_en_rect_gray_20.png" />';
								view.container.appendChild(pinItBtn);
								(function(d){
								    var f = d.getElementsByTagName('SCRIPT')[0], p = d.createElement('SCRIPT');
								    p.type = 'text/javascript';
								    p.async = true;
								    p.src = 'http://assets.pinterest.com/js/pinit.js';
								    f.parentNode.insertBefore(p, f);
								}(document));
							}
						}
						ajax.send('img=' + imgURL);
						
					}
				});
			}
		}

		function bindEvents() {
			mediator.subscribe('previewBtnClicked', controller.onPreviewBtnClicked);
			view.closeBtn.onclick = function() {
				view.hide();
				view.clear();
			}
		}

		return {
			init: function() {
				bindEvents();
			}
		}
	})();

	
	function bindEvents() {
		mediator.subscribe('chartSizeBtnClicked', function() {
			mediator.publish('chartResizeRequest', Editor.getChartSize());
		});
	}
	

	return {
		init: function() {
			Menu.init();
			ColorPicker.init();
			Previewer.init();
			IconPicker.init();
			Editor.init();
			Properties.init();
			bindEvents();
		},
		editor: Editor
	}
})();

window.onload = function() {
	app.init();
}