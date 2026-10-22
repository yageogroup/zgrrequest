sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/ui/unified/FileUploader"
], function (MessageToast, MessageBox, Dialog, Button, VBox, FileUploader) {
    "use strict";

    // Same namespace as manualPo - check the exact action name/casing in $metadata
    var ACTION = "com.sap.gateway.srvd.zsd_gr_request.v0001.attachFile";

    function readAsBase64(oFile) {
        return new Promise(function (resolve, reject) {
            var oReader = new FileReader();
            oReader.onload = function (e) {
                var aBytes = new Uint8Array(e.target.result);
                var sBinary = "";
                for (var i = 0; i < aBytes.length; i += 0x8000) {
                    sBinary += String.fromCharCode.apply(null, aBytes.subarray(i, i + 0x8000));
                }
                resolve(btoa(sBinary));
            };
            oReader.onerror = reject;
            oReader.readAsArrayBuffer(oFile);
        });
    }

    return {
        /**
         * Object Page header action: attach the delivery note to a Manual PO request.
         * `this` is the FE ExtensionAPI of the Object Page.
         */
        attachFile: function (oContext) {
            var oExtAPI = this;
            var oBindingContext = oContext || oExtAPI.getBindingContext();
            var oModel = oBindingContext.getModel();
            var oSelectedFile = null;

            var oUploader = new FileUploader({
                width: "100%",
                fileType: ["pdf"],
                mimeType: ["application/pdf"],
                placeholder: "Choose delivery note (PDF)",
                change: function (oEvent) {
                    var aFiles = oEvent.getParameter("files");
                    oSelectedFile = aFiles && aFiles[0] ? aFiles[0] : null;
                },
                typeMissmatch: function () {
                    MessageToast.show("Only PDF files are allowed");
                }
            });

            var oDialog = new Dialog({
                title: "Attach Source File",
                contentWidth: "24rem",
                content: new VBox({ items: [oUploader] }).addStyleClass("sapUiSmallMargin"),

                beginButton: new Button({
                    text: "Upload",
                    type: "Emphasized",
                    press: function () {
                        if (!oSelectedFile) {
                            MessageToast.show("Choose a file first");
                            return;
                        }
                        if (oDialog.getBusy()) {
                            return;
                        }
                        oDialog.setBusy(true);

                        readAsBase64(oSelectedFile).then(function (sBase64) {
                            var oAction = oModel.bindContext(ACTION + "(...)", oBindingContext);
                            oAction.setParameter("file_name", oSelectedFile.name);
                            oAction.setParameter("mime_type", oSelectedFile.type || "application/pdf");
                            oAction.setParameter("file_content", sBase64);
                            return oAction.execute();
                        }).then(function () {
                            MessageToast.show("File attached");
                            oDialog.close();
                            oBindingContext.refresh();          // reload header (Source File)
                        }).catch(function (oError) {
                            MessageBox.error((oError && oError.message) || "File could not be attached");
                        }).finally(function () {
                            oDialog.setBusy(false);
                        });
                    }
                }),

                endButton: new Button({
                    text: "Cancel",
                    press: function () { oDialog.close(); }
                }),

                afterClose: function () { oDialog.destroy(); }
            });

            oExtAPI.addDependent(oDialog);
            oDialog.open();
        }
    };
});