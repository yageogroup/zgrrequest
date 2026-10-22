sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function (ControllerExtension) {
    "use strict";

    // Shows the "ManualPO" toolbar action (manifest key) as a scan icon
    var ACTION_ID = /CustomAction::ManualPO$/;

    function decorate(oView) {
        var aButtons = oView.findAggregatedObjects(true, function (oCtrl) {
            return oCtrl.isA("sap.m.Button") && ACTION_ID.test(oCtrl.getId());
        });

        aButtons.forEach(function (oBtn) {
            if (oBtn.getIcon() !== "sap-icon://bar-code") {
                oBtn.setIcon("sap-icon://bar-code");
                oBtn.setText("");
                oBtn.setTooltip("Scan / enter Purchase Order");
            }
        });
        return aButtons.length > 0;
    }

    return ControllerExtension.extend("zgrrequest.ext.controller.ListReportExt", {
        override: {
            onAfterRendering: function () {
                var oView = this.base.getView();
                var iTries = 0;

                // the table toolbar is created asynchronously -> retry a few times
                (function tryDecorate() {
                    if (!decorate(oView) && iTries++ < 10) {
                        setTimeout(tryDecorate, 300);
                    }
                })();
            }
        }
    });
});