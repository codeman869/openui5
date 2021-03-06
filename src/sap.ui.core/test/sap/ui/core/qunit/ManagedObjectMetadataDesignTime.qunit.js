/*!
 * ${copyright}
 */

// QUnit script for DesignTime support for ManagedOjbectMetadata
sap.ui.require([
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/base/ManagedObject"], function(ManagedObjectMetadata, ManagedObject) {
	"use strict";

	QUnit.module("Design Time Metadata", {
		beforeEach: function() {
			var oMetadata = {
				designTime: true
			},
			oMetadataLocal = {
				designTime: {
					local: "local"
				}
			},
			oMetadataModule = {
				designTime: "sap/test/DTManagedObjectChild4.designtime"
			};

			// build the inheritance chain of DesignTimeManagedObjects, one without DesignTime in between
			ManagedObject.extend("DTManagedObject", {
				metadata: oMetadata
			});
			DTManagedObject.extend("DTManagedObjectChild", {
				metadata: oMetadata
			});

			DTManagedObjectChild.extend("NoDTManagedObjectChild2");

			NoDTManagedObjectChild2.extend("DTManagedObjectChild3", {
				metadata: oMetadata
			});

			DTManagedObjectChild.extend("DTManagedObjectLocal", {
				metadata: oMetadataLocal
			});

			DTManagedObjectChild.extend("DTManagedObjectModule", {
				metadata: oMetadataModule
			});

			// DesignTime metadata
			this.oDTForManagedObject = {
				metaProp1: "1",
				metaProp2: "2",
				metaPropDeep: {
					metaPropDeep1 : "deep1"
				},
				metaPropDeep2: {
					metaPropDeep21 : "deep21"
				}
			};
			this.oDTForManagedObjectChild = {
				metaProp2: "2-overwritten",
				metaProp3: "3",
				metaProp4: "4",
				metaPropDeep: {
					metaPropDeep2 : "deep2",
					metaPropDeep3 : "deep3"
				},
				metaPropDeep2: {
					metaPropDeep21 : "deep21-overwritten"
				}
			};
			this.oDTForManagedObjectChild3 = {
				metaProp3: "3.1",
				metaProp4: undefined,
				metaPropDeep: {
					metaPropDeep1 : "deep1-overwritten",
					metaPropDeep3 : undefined
				},
				metaPropDeep2: undefined
			};

			this.oDTForManagedObjectLocal = {
				local: "local",
				metaProp2: "2-overwritten",
				metaProp3: "3",
				metaProp4: "4",
				metaPropDeep: {
					metaPropDeep2 : "deep2",
					metaPropDeep3 : "deep3"
				},
				metaPropDeep2: {
					metaPropDeep21 : "deep21-overwritten"
				}
			};

			this.oDTForManagedObjectModule = {
				module : "module"
			};

			// stub the DesignTime require calls (make sure the sap.ui.require callback is called asynchronously)
			this.oRequireStub = sinon.stub(sap.ui, "require");
			this.oRequireStub.withArgs(["DTManagedObject.designtime"]).callsArgWithAsync(1, this.oDTForManagedObject);
			this.oRequireStub.withArgs(["DTManagedObjectChild.designtime"]).callsArgWithAsync(1, this.oDTForManagedObjectChild);
			this.oRequireStub.withArgs(["DTManagedObjectChild3.designtime"]).callsArgWithAsync(1, this.oDTForManagedObjectChild3);
			this.oRequireStub.withArgs(["sap/test/DTManagedObjectChild4.designtime"]).callsArgWithAsync(1, this.oDTForManagedObjectModule);
		},

		afterEach: function() {
			// reset design time cache
			DTManagedObject.getMetadata()._oDesignTime = null;
			DTManagedObject.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectChild.getMetadata()._oDesignTime = null;
			DTManagedObjectChild.getMetadata()._oDesignTimePromise = null;

			NoDTManagedObjectChild2.getMetadata()._oDesignTime = null;
			NoDTManagedObjectChild2.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectChild3.getMetadata()._oDesignTime = null;
			DTManagedObjectChild3.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectLocal.getMetadata()._oDesignTime = null;
			DTManagedObjectLocal.getMetadata()._oDesignTimePromise = null;

			DTManagedObjectLocal.getMetadata()._oDesignTime = null;
			DTManagedObjectLocal.getMetadata()._oDesignTimePromise = null;

			this.oRequireStub.restore();
		}
	});

	QUnit.test("loadDesignTime - no inheritance", function(assert) {
		return DTManagedObject.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.ok(oDesignTime, "DesignTime was passed");
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaProp2, "2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - with simple inheritance", function(assert) {
		return DTManagedObjectChild.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - with designtime only via inheritance", function(assert) {
		return NoDTManagedObjectChild2.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.designtimeModule, undefined, "DesignTime module path not defined");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - with transitive inheritance", function(assert) {
		return DTManagedObjectChild3.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp3, "3.1", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaProp4, undefined, "DesignTime data was removed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, undefined, "DesignTime data was removed");
			assert.strictEqual(oDesignTime.metaPropDeep2, undefined, "DesignTime data was removed");
			assert.strictEqual(oDesignTime.designtimeModule, "DTManagedObjectChild3.designtime", "DesignTime module path defined");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - with inheritance and local", function(assert) {
		return DTManagedObjectLocal.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.strictEqual(oDesignTime.local, "local", "DesignTime data was local");
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was removed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.designtimeModule, undefined, "DesignTime module path not defined");
		}.bind(this));
	});

	QUnit.test("loadDesignTime - with inheritance and module", function(assert) {
		return DTManagedObjectModule.getMetadata().loadDesignTime().then(function(oDesignTime) {
			assert.strictEqual(oDesignTime.module, "module", "DesignTime data was local");
			assert.strictEqual(oDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oDesignTime.metaProp3, "3", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaProp4, "4", "DesignTime data was removed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was overwritten");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was removed");
			assert.strictEqual(oDesignTime.designtimeModule, "sap/test/DTManagedObjectChild4.designtime", "DesignTime module path defined");
		}.bind(this));
	});


	QUnit.test("loadDesignTime - all in parallel", function(assert) {
		return Promise.all([
			DTManagedObject.getMetadata().loadDesignTime(),
			DTManagedObjectChild.getMetadata().loadDesignTime(),
			NoDTManagedObjectChild2.getMetadata().loadDesignTime(),
			DTManagedObjectChild3.getMetadata().loadDesignTime()
		]).then(function(aDesignTimes) {

			// Only 3 require calls are expected, as one ManagedObject (NoDTManagedObjectChild2) does not have design time data
			sinon.assert.callCount(this.oRequireStub, 3);

			var oDTManagedObjectDesignTime = aDesignTimes[0];
			assert.strictEqual(oDTManagedObjectDesignTime.metaProp1, "1", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectDesignTime.metaProp2, "2", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectDesignTime.metaPropDeep2.metaPropDeep21, "deep21", "DesignTime data was passed");

			var oDTManagedObjectChildDesignTime = aDesignTimes[1];
			assert.strictEqual(oDTManagedObjectChildDesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDTManagedObjectChildDesignTime.metaProp2, "2-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDTManagedObjectChildDesignTime.metaProp3, "3", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectChildDesignTime.metaProp4, "4", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectChildDesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectChildDesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectChildDesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectChildDesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");

			var oNoDTManagedObjectChild2DesignTime = aDesignTimes[2];
			assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaProp3, "3", "DesignTime data was inherited");
			assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaProp4, "4", "DesignTime data was inherited");
			assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaPropDeep.metaPropDeep1, "deep1", "DesignTime data was passed");
			assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaPropDeep.metaPropDeep3, "deep3", "DesignTime data was passed");
			assert.strictEqual(oNoDTManagedObjectChild2DesignTime.metaPropDeep2.metaPropDeep21, "deep21-overwritten", "DesignTime data was overwritten");

			var oDTManagedObjectChild3DesignTime = aDesignTimes[3];
			assert.strictEqual(oDTManagedObjectChild3DesignTime.metaProp1, "1", "DesignTime data was inherited");
			assert.strictEqual(oDTManagedObjectChild3DesignTime.metaProp2, "2-overwritten", "DesignTime data was inherited");
			assert.strictEqual(oDTManagedObjectChild3DesignTime.metaProp3, "3.1", "DesignTime data was overwritten");
			assert.strictEqual(oDTManagedObjectChild3DesignTime.metaProp4, undefined, "DesignTime data was removed");
			assert.strictEqual(oDTManagedObjectChild3DesignTime.metaPropDeep.metaPropDeep1, "deep1-overwritten", "DesignTime data was overwritten");
			assert.strictEqual(oDTManagedObjectChild3DesignTime.metaPropDeep.metaPropDeep2, "deep2", "DesignTime data was passed");
			assert.strictEqual(oDTManagedObjectChild3DesignTime.metaPropDeep.metaPropDeep3, undefined, "DesignTime data was removed");
			assert.strictEqual(oDTManagedObjectChild3DesignTime.metaPropDeep2, undefined, "DesignTime data was removed");

		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results", function(assert) {
		var oDTManagedObjectMetadata = DTManagedObjectChild3.getMetadata();
		return oDTManagedObjectMetadata.loadDesignTime().then(function() {
			sinon.assert.callCount(this.oRequireStub, 3);
			this.oRequireStub.reset();
			return oDTManagedObjectMetadata.loadDesignTime().then(function() {
				assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results implicitly (parent first)", function(assert) {
		return DTManagedObjectChild.getMetadata().loadDesignTime().then(function() {
			sinon.assert.callCount(this.oRequireStub, 2);
			this.oRequireStub.reset();
			return DTManagedObjectChild3.getMetadata().loadDesignTime().then(function() {
				sinon.assert.callCount(this.oRequireStub, 1);
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results implicitly (child first)", function(assert) {
		return DTManagedObjectChild3.getMetadata().loadDesignTime().then(function() {
			sinon.assert.callCount(this.oRequireStub, 3);
			this.oRequireStub.reset();
			return DTManagedObjectChild.getMetadata().loadDesignTime().then(function() {
				assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results implicitly (child  with parent + other child with same parent)", function(assert) {

		return DTManagedObjectChild.getMetadata().loadDesignTime().then(function(oTestOuter) {
			sinon.assert.callCount(this.oRequireStub, 2);
			this.oRequireStub.reset();
			//previously the issue was that a derived control deleted the parents designtimeModule.
			//any other child did not set the correct designtimeModule path

			//load derived metadata DTManagedObjectChild3 that inherits DTManagedObject
			DTManagedObjectChild3.getMetadata().loadDesignTime().then(function(oTestOuter3) {
				sinon.assert.callCount(this.oRequireStub, 1);
				this.oRequireStub.reset();
				return DTManagedObject.getMetadata().loadDesignTime().then(function(oTestInner) {
					assert.strictEqual(oTestInner.designtimeModule, "DTManagedObject.designtime", "DesignTime module path defined DTManagedObjectChild");
				}.bind(this));
				assert.strictEqual(oTestOuter3.designtimeModule, "DTManagedObjectChild3.designtime", "DesignTime module path defined DTManagedObjectChild3");
			}.bind(this))
			//load derived metadata DTManagedObjectChild3 that inherits DTManagedObjectChild
			DTManagedObjectChild.getMetadata().loadDesignTime().then(function(oTestInner) {
				return DTManagedObject.getMetadata().loadDesignTime().then(function(oTestInner2) {
					assert.strictEqual(oTestInner2.designtimeModule, "DTManagedObject.designtime", "DesignTime module path defined DTManagedObjectChild");
				}.bind(this));
				assert.strictEqual(oTestInner.designtimeModule, "DTManagedObjectChild.designtime", "DesignTime module path defined DTManagedObjectChild, parent still valid");
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("loadDesignTime - cache the results with designtime only via inheritance", function(assert) {
		var oDTManagedObjectMetadataChild = NoDTManagedObjectChild2.getMetadata();
		return oDTManagedObjectMetadataChild.loadDesignTime().then(function(oDesignTime) {
			sinon.assert.callCount(this.oRequireStub, 2);
			this.oRequireStub.reset();
			return oDTManagedObjectMetadataChild.loadDesignTime().then(function() {
				assert.notOk(this.oRequireStub.called, "sap.ui.require was not called");
			}.bind(this));
		}.bind(this));
	});

});
