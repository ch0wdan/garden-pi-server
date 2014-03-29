if (typeof (garden_pi) == 'undefined') {
    garden_pi = {};
};

if (typeof (garden_pi.views) == 'undefined') {
    garden_pi.views = {};
};

garden_pi.common = {
    setSelectedTab : function(tabId) {
        $('#tabMenu ul.nav li a.active').removeClass('active');
        $('#tabMenu ul.nav li.active').removeClass('active');
        $('#tabMenu div.tab-content div.active').removeClass('active');
        $('#tabMenu ul.nav li a[href="#' + tabId + '"]').addClass('active');
        $('#tabMenu ul.nav li a[href="#' + tabId + '"]').parent().addClass('active');
        $('#tabMenu div.tab-content div#' + tabId).addClass('active');
    },
    initSensorTypesAndRoles : function() {
        var oThis = this;
        $.ajax({
            type : 'GET',
            url : '/sensors/roles',
            success : function(data, textStatus, jqXHR) {
                oThis.sensorRoles = data;
            },
            error : function(){
                alert('sensor roles fetch failed!');
            }
        });
        $.ajax({
            type : 'GET',
            url : '/sensors/types',
            success : function(data, textStatus, jqXHR) {
                oThis.sensorTypes = data;
            },
            error : function(){
                alert('sensor types fetch failed!');
            }
        });
    },
    renderChart : function(chartContainer, chartData, sensorArray) {
        this.chart = new Highcharts.Chart({
			title: { text : null },
			chart: { renderTo: chartContainer, type: 'line' },
			colors : [ '#46BD00' ],
			xAxis: {
				categories: ['12:00', '12:01', '12:02', '12:03', '12:04', '12:05', '12:06', '12:07', '12:08', '12:09', '12:10', '12:11', '12:12', '12:13', '12:14', '12:15']
			},
			yAxis: {
				title: { text: 'Degrees Celsius' }
			},
			series: [{
				name: 'Temperature',
				data: [21, 20, 20, 19, 18, 16, 15, 12, 10, 5, 3, -3, 3, 8, 16, 25]
			}]
		});
    },
    currentLocation : null,
    currentLocationInfo : null,
    sensorTypes : null,
    sensorRoles : null,
}

garden_pi.router = Backbone.Router.extend({
    locationSelectorView : null,
	activeView : null,
    defaultLocation : null,
    usersLocations : null,

	routes: {
        'locations/:id/start' : 'showStartPage',
        'locations/:id/temperatures' : 'showTemperaturesTab',
        'locations/:id/soil' : 'showSoilTab',
        'locations/:id/events' : 'showEventsTab',
        'locations/:id/fullReport' : 'showReportsTab',
        'locations/:id/control' : 'showControlTab',
        '*Path' : 'defaultRoute'
	},
	initialize: function(options) {
        var oThis = this;
        _.bindAll(oThis, 'initializeSpinWait', 'defaultRoute', 'showLocationSelector');
        Backbone.history.start();        
        
        $('#tabMenu ul li a').click(
            function() { 
                var finalSegment = this.href.substr(this.href.lastIndexOf('#') + 1);
                oThis.navigate('locations/'+ garden_pi.common.currentLocation +'/' + finalSegment);
                oThis.showLocationSelector(garden_pi.common.currentLocation);
            }
        );
            
        $.ajax({
            type : 'GET',
            url : '/locations',
            success : function(data, textStatus, jqXHR) {
                oThis.usersLocations = data;
                for(var i = 0; i < data.length; i++) {
                    if (data[i].is_default) {
                        oThis.defaultLocation = data[i].id;
                        return;
                    }
                };
                alert('no default location set!');
            },
            error : function(){
                alert('user locations fetch failed!');
            }
        });
        
        garden_pi.common.initSensorTypesAndRoles();
	},
    initializeSpinWait : function(callback, id) {
        var oThis = this;
        if (!this.defaultLocation) 
        { 
            setTimeout(function() { oThis.initializeSpinWait(callback, id); }, 250); 
        } else {
            _.bind(callback, oThis, id || oThis.defaultLocation)();
        }
    },
    showLocationSelector : function(id) {
        if (this.locationSelectorView) { this.locationSelectorView.destroy(); }
        this.locationSelectorView = new garden_pi.views.locationSelectorView({ 'id' : id, 'usersLocations' : this.usersLocations });
    },
    defaultRoute : function(id) {
        this.showStartPage(id);
    },
    showStartPage : function(id) {
        if (!this.defaultLocation) { this.initializeSpinWait(this.showStartPage, id); return; }
        id = this.generalSetup(id, true);
        this.activeView = new garden_pi.views.startPageView( {'id' : id } );
    },            
    showTemperaturesTab : function(id) {
        if (!this.defaultLocation) { this.initializeSpinWait(this.showTemperaturesTab, id); return; }
        id = this.generalSetup(id, false);
		this.activeView = new garden_pi.views.tempTabView( {'id' : id } );
	},
    showSoilTab : function(id) {
        if (!this.defaultLocation) { this.initializeSpinWait(this.showSoilTab, id); return; }
        id = this.generalSetup(id, false);
		this.activeView = new garden_pi.views.soilTabView( {'id' : id } );
	},
    showEventsTab : function(id) {
        if (!this.defaultLocation) { this.initializeSpinWait(this.showEventsTab, id); return; }
        id = this.generalSetup(id, false);
		this.activeView = new garden_pi.views.eventTabView( {'id' : id } );
	},
    showReportsTab : function(id) {
        if (!this.defaultLocation) { this.initializeSpinWait(this.showReportsTab, id); return; }
        id = this.generalSetup(id, false);
		this.activeView = new garden_pi.views.reportTabView( {'id' : id } );
	},
	showControlTab : function(id) {
        if (!this.defaultLocation) { this.initializeSpinWait(this.showControlTab, id); return; }
        id = this.generalSetup(id, false);
		this.activeView = new garden_pi.views.controlTabView( {'id' : id } );
	},
    generalSetup : function(id, isStartPage) {
        if (this.activeView) { this.activeView.destroy(); }
        if (!id) { id = this.defaultLocation; }
        if (garden_pi.common.currentLocation != id) {
            garden_pi.common.currentLocationInfo = null;
            this.updateLocationInfo(id);
            garden_pi.common.currentLocation = id;
        }
        this.showLocationSelector(id);
        if (isStartPage) {
            $('#tabMenu').hide();$('#startPage').show();
        } else {
            $('#startPage').hide();$('#tabMenu').show();
        }
        return id;
    },
    updateLocationInfo : function(id) {
        var oThis = this;
        $.ajax({
                type : 'GET',
                url : '/locations/' + id,
                success : function(data, textStatus, jqXHR) {
                    garden_pi.common.currentLocationInfo = data;
                },
                error : function(jqXHR, textStatus, errorThrown){
                    alert('selected location info fetch failed!');
                }
            });
    }

});


garden_pi.views.locationSelectorView = Backbone.View.extend({
    template : 'location-selector-template',
    el: null,
    events: {
        
    },
    initialize: function() {
        this.render();
    },
    render: function() {
        var oThis = this;
        if (!ich[oThis.template]) {
			ich.grabTemplates();
		}
        var selectedName;
        for(var i = 0; i < oThis.options.usersLocations.length; i++) {
            if (oThis.options.usersLocations[i].id.toString() === oThis.id.toString())
                selectedName = oThis.options.usersLocations[i].name;
        }
        var cleanUrl = (document.URL.substr(-1) === '/') ? document.URL.substr(0, document.URL.length - 1) : document.URL;
        var lastSegment = cleanUrl.substr(cleanUrl.lastIndexOf('/') + 1);
        if (cleanUrl.lastIndexOf('/') === (cleanUrl.lastIndexOf('://') + 2)) lastSegment = 'start';
        var content = ich[oThis.template]( { 'topLevel' : { 'locations' : oThis.options.usersLocations, 'selectedName' : selectedName, 'currentPage' : lastSegment } });
        $('#location-selector-container').empty().append(content);
        oThis.setElement(content);
    },
    destroy: function() {
        this.undelegateEvents();
		$(this.el).removeData().unbind(); 
		this.remove();  
		Backbone.View.prototype.remove.call(this);
    }
});

garden_pi.views.startPageView = Backbone.View.extend({
    template : 'start-page-template',
	el: '#startPage',
	events : {
	},
	initialize: function () {
		this.render();
	},
	render: function () {
        var oThis = this;
        if (!ich[oThis.template]) {
			ich.grabTemplates();
		}
        var content = ich[oThis.template]( { 'id' : oThis.id } );
        $(this.el).empty().append(content);
	},
	destroy : function() {
		$(this.el).empty();
	}
});

garden_pi.views.tempTabView = Backbone.View.extend({
    template : 'chart-template',
	el: '#content-temp',
	events : {
	},
	initialize: function () {
		this.render();
	},
	render: function () {
        var oThis = this;
        $(this.el).empty();
		if (!ich[this.template]) { ich.grabTemplates(); }
        
        var data = garden_pi.common.currentLocationInfo.location;
        data.type = location;
		var $content = $(ich[oThis.template](data));
		$(this.el).append($content);
		
		garden_pi.common.renderChart( $('.chart', $content)[0]
            , data, data.sensors);
        
        garden_pi.common.setSelectedTab('temperatures');
	},
	destroy : function() {
		this.undelegateEvents();
		$(this.el).removeData().unbind(); 
        $(this.el).empty();
		//this.remove();  
		//Backbone.View.prototype.remove.call(this);
	}
});

garden_pi.views.soilTabView = Backbone.View.extend({
	template : '',
	el: null,
	events : {
	},
	initialize: function () {
		this.render();
	},
	render: function () {
		/*var oThis = this;
		if (!ich[this.template]) { ich.grabTemplates(); }

		var content = ich[oThis.template]();
		$('#container').empty().append( content );
		oThis.setElement(content);*/
        garden_pi.common.setSelectedTab('soil');
	},
	destroy : function() {
		this.undelegateEvents();
		$(this.el).removeData().unbind(); 
		this.remove();  
		Backbone.View.prototype.remove.call(this);
	}
});

garden_pi.views.eventTabView = Backbone.View.extend({
	template : '',
	el: null,
	events : {
	},
	initialize: function () {
		this.render();
	},
	render: function () {
		/*var oThis = this;
		if (!ich[this.template]) { ich.grabTemplates(); }

		var content = ich[oThis.template]();
		$('#container').empty().append( content );
		oThis.setElement(content);*/
        garden_pi.common.setSelectedTab('events');
	},
	destroy : function() {
		this.undelegateEvents();
		$(this.el).removeData().unbind(); 
		this.remove();  
		Backbone.View.prototype.remove.call(this);
	}
});

garden_pi.views.reportTabView = Backbone.View.extend({
	template : '',
	el: null,
	events : {
	},
	initialize: function () {
		this.render();
	},
	render: function () {
		/*var oThis = this;
		if (!ich[this.template]) { ich.grabTemplates(); }

		var content = ich[oThis.template]();
		$('#container').empty().append( content );
		oThis.setElement(content);*/
        garden_pi.common.setSelectedTab('fullReport');
	},
	destroy : function() {
		this.undelegateEvents();
		$(this.el).removeData().unbind(); 
		this.remove();  
		Backbone.View.prototype.remove.call(this);
	}
});

garden_pi.views.controlTabView = Backbone.View.extend({
	template : '',
	el: null,
	events : {
	},
	initialize: function () {
		this.render();
	},
	render: function () {
		/*var oThis = this;
		if (!ich[this.template]) { ich.grabTemplates(); }

		var content = ich[oThis.template]();
		$('#container').empty().append( content );
		oThis.setElement(content);*/
        garden_pi.common.setSelectedTab('control');
	},
	destroy : function() {
		this.undelegateEvents();
		$(this.el).removeData().unbind(); 
		this.remove();  
		Backbone.View.prototype.remove.call(this);
	}
});