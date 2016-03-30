/**
 * Created by kraig on 3/20/16.
 */

var inherit = require('./inherit');

var HubAccessoryBase, Service, Characteristic;

module.exports = function(exportedTypes) {
	if (exportedTypes && !HubAccessoryBase) {
		HubAccessoryBase = exportedTypes.HubAccessoryBase;
		Service = exportedTypes.Service;
		Characteristic = exportedTypes.Characteristic;

		inherit.changeBase(Activity, HubAccessoryBase);
	}
	return Activity;
};

function Activity(log, details, changeCurrentActivity, connection) {
	this.id = details.id;
	this.isOn = false;
	this.changeCurrentActivity = changeCurrentActivity;
	HubAccessoryBase.call(this, connection, this.id, details.label, log);
	var self = this;

	this.getService(Service.AccessoryInformation)
		// TODO: Add hub unique id to this for people with multiple hubs so that it is really a guid.
		.setCharacteristic(Characteristic.SerialNumber, this.id);

	this.addService(Service.Switch)
		.getCharacteristic(Characteristic.On)
		.on('get', function (callback) {
			// Refreshed automatically by platform
			callback(null, self.isOn);
		})
		.on('set', this.setPowerState.bind(this));

}

Activity.prototype.updateActivityState = function (currentActivity) {
	this.isOn = (currentActivity === this.id);
	// Force get to trigger 'change' if needed
	this.getService(Service.Switch)
		.getCharacteristic(Characteristic.On)
		.getValue();
};

Activity.prototype.setPowerState = function (state, callback) {
	this.changeCurrentActivity(state ? this.id : null, callback);
};