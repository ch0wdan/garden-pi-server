if (typeof (garden-pi) == "undefined") {
    garden-pi = {};
};

if (typeof (garden-pi.views) == "undefined") {
    garden-pi.views = {};
};


garden-pi.router = Backbone.Router.extend({
	activeView : null,

	routes: {
        "/locations/:id/temperature" : "showTemperatures",
        "/locations/:id/soil" : "showSoil",
        "/locations/:id/events" : "showEvents",
        "/locations/:id/full_report" : "showReport",
        "/locations/:id/control" : "showControl"
	},
	initialize: function(options) {
	},
    showTemperatures : function(id) {
		if (this.activeView) { this.activeView.destroy(); }
		this.activeView = new garden-pi.views.showTemperatures( {'id' : id } );
	}
    showSoil : function(id) {
		if (this.activeView) { this.activeView.destroy(); }
		this.activeView = new garden-pi.views.showSoil( {'id' : id } );
	}
    showEvents : function(id) {
		if (this.activeView) { this.activeView.destroy(); }
		this.activeView = new garden-pi.views.showEvents( {'id' : id } );
	}
    showReport : function(id) {
		if (this.activeView) { this.activeView.destroy(); }
		this.activeView = new garden-pi.views.showReport( {'id' : id } );
	}
	showControl : function(id) {
		if (this.activeView) { this.activeView.destroy(); }
		this.activeView = new garden-pi.views.showControl( {'id' : id } );
	}

});


fis.views.showTemperatures = Backbone.View.extend({
	template : 'list-trips-page-template',
	trip_list_template: 'trip-list-template',
	el: null,
	events : {
		"click tr[data-url]" : "selectTrip"
	},
	initialize: function () {
		this.render();
	},
	render: function () {
		var oThis = this;
		if ((!ich[this.template]) || (!ich[this.trip_list_template])) {
			ich.grabTemplates();
		}

		var content = ich[oThis.template]();
		$('#container').empty().append(content);
		oThis.setElement(content);

		$.ajax({
			type : 'GET',
			url : '/watch/list',
			success : function(data, textStatus, jqXHR) {
				for(var i = 0; i < data.length; i++) {
					var startDate = data[i].actualStartTime || data[i].estimatedStartTime;
					data[i].startTime = moment(startDate).format('DD/MM/YYYY HH:mm');
					data[i].started = (data[i].actualStartTime ? 'Yes' : 'No');
					data[i].complete = (data[i].open ? 'No' : 'Yes');
				}
				var content = ich[oThis.trip_list_template]( { 'tripList' : data } );
				$('#trip-list').append(content);
			},
			error : function(){
				alert('watch list fetch failed!');
			}
		});        
	},
	selectTrip : function(event) {
		window.location = $(event.currentTarget).data('url');
	},
	destroy : function() {
		this.undelegateEvents();
		$(this.el).removeData().unbind(); 
		this.remove();  
		Backbone.View.prototype.remove.call(this);
	}
});