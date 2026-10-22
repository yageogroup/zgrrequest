sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/HBox",
    "sap/m/FlexItemData",
    "sap/ndc/BarcodeScannerButton"
], function (MessageToast, MessageBox, Dialog, Button, Input, Label, VBox,
             SelectDialog, StandardListItem, Filter, FilterOperator, Sorter,
             HBox, FlexItemData, BarcodeScannerButton) {
    "use strict";

    // From $metadata: entity set ZP_GR_REQUEST_HEAD, namespace zsd_gr_request.v0001, action manualPo
    var ENTITY_SET = "/ZP_GR_REQUEST_HEAD";
    var ACTION     = "com.sap.gateway.srvd.zsd_gr_request.v0001.manualPo";
    var PO_VH_SET  = "/I_PurchaseOrder";          // already exposed in the service

    // Barcode may carry a prefix/suffix (e.g. "PO4500012345-10") -> take the PO number out of it
    function extractPo(sText) {
        var s = (sText || "").trim();
        var aMatch = s.match(/\d{10}/);
        if (aMatch) {
            return aMatch[0];
        }
        return s.replace(/\D/g, "").slice(0, 10);
    }

    function openPoValueHelp(oExtAPI, oInput) {
        var oVH = new SelectDialog({
            title: "Select Purchase Order",
            growing: true,
            growingThreshold: 50,
            items: {
                path: PO_VH_SET,
                parameters: { $select: "PurchaseOrder,Supplier,CompanyCode,PurchaseOrderDate" },
                sorter: new Sorter("PurchaseOrder", true),
                template: new StandardListItem({
                    title: "{PurchaseOrder}",
                    description: "Supplier {Supplier}",
                    info: "{CompanyCode}"
                })
            },
            search: function (oEvent) {
                var sValue = (oEvent.getParameter("value") || "").trim();
                var aFilters = sValue ? [
                    new Filter({
                        filters: [
                            new Filter("PurchaseOrder", FilterOperator.Contains, sValue),
                            new Filter("Supplier", FilterOperator.Contains, sValue)
                        ],
                        and: false
                    })
                ] : [];
                oEvent.getSource().getBinding("items").filter(aFilters);
            },
            confirm: function (oEvent) {
                var oItem = oEvent.getParameter("selectedItem");
                if (oItem) {
                    oInput.setValue(oItem.getTitle());
                    oInput.setValueState("None");
                }
            },
            afterClose: function () {
                oVH.destroy();
            }
        });

        oExtAPI.addDependent(oVH);
        oVH.open(oInput.getValue());
    }

    return {
        /**
         * Manual PO - create a GR Request with all open items of a PO (no AI extraction).
         * `this` is the FE ExtensionAPI of the List Report.
         */
        manualpo: function (oContext, aSelectedContexts) {
            var oExtAPI = this;
            var oModel  = oExtAPI.getModel();

            var oInput = new Input({
                maxLength: 10,
                placeholder: "Enter or select purchase order",
                showValueHelp: true,
                valueHelpRequest: function () {
                    openPoValueHelp(oExtAPI, oInput);
                },
                liveChange: function () {
                    oInput.setValueState("None");
                },
                // hand-held scanners in keyboard mode type the code and send Enter
                submit: function () {
                    oInput.setValue(extractPo(oInput.getValue()));
                    oCreateBtn.firePress();
                }
            }).setLayoutData(new FlexItemData({ growFactor: 1 }));

            var oScanBtn = new BarcodeScannerButton({
                provideFallback: true,          // manual-entry popup if no camera
                width: "auto",
                scanSuccess: function (oEvent) {
                    if (oEvent.getParameter("cancelled")) {
                        return;
                    }
                    var sPO = extractPo(oEvent.getParameter("text"));
                    if (!sPO) {
                        MessageToast.show("No purchase order found in the scanned code");
                        return;
                    }
                    oInput.setValue(sPO);
                    oInput.setValueState("None");
                },
                scanFail: function () {
                    MessageToast.show("Scan failed, enter the purchase order manually");
                }
            }).addStyleClass("sapUiTinyMarginBegin");

            var oCreateBtn;

            var oDialog = new Dialog({
                title: "Create GR Request from PO",
                contentWidth: "22rem",
                content: new VBox({
                    items: [
                        new Label({ text: "Purchase Order", labelFor: oInput, required: true }),
                        new HBox({
                            alignItems: "Center",
                            items: [oInput, oScanBtn]
                        })
                    ]
                }).addStyleClass("sapUiSmallMargin"),

                beginButton: oCreateBtn = new Button({
                    text: "Create",
                    type: "Emphasized",
                    press: function () {
                        var sPO = (oInput.getValue() || "").trim();
                        if (!sPO) {
                            oInput.setValueState("Error");
                            oInput.setValueStateText("Enter a purchase order");
                            return;
                        }

                        if (oDialog.getBusy()) {
                            return;
                        }
                        oDialog.setBusy(true);
                        var oAction = oModel.bindContext(ENTITY_SET + "/" + ACTION + "(...)");
                        oAction.setParameter("Ebeln", sPO);

                        oAction.execute().then(function () {
                            MessageToast.show("GR Request created for PO " + sPO);
                            oDialog.close();
                            oExtAPI.refresh();          // reload the list
                        }).catch(function (oError) {
                            MessageBox.error(oError.message || "GR Request could not be created");
                        }).finally(function () {
                            oDialog.setBusy(false);
                        });
                    }
                }),

                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                    }
                }),

                afterClose: function () {
                    oDialog.destroy();
                }
            });

            oExtAPI.addDependent(oDialog);
            oDialog.open();
        }
    };
});