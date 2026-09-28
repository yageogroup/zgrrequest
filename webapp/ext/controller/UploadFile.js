sap.ui.define(["sap/m/MessageToast", "sap/m/MessageBox"], function(MessageToast, Log) {
    "use strict";
    return {
        _pDialog: null,
        uploadHandler: function(oEvent, oView) {
            if (!this.pDialog) {
                this.pDialog = new sap.m.Dialog({
                    id: "uploadDialogBox",
                    title: "Upload File",
                    buttons: [
                        new sap.m.Button({
                            id: "fileUploadButton",
                            text: "Upload",
                            press: function() {
                                if (sap.ui.getCore().byId("fileUploader").getValue() === "") {
                                    MessageToast.show("Please select a file first.");
                                    sap.ui.getCore().byId("fileUploader").setValueState("Error");
                                    return;
                                }

                                const reader = new FileReader();
                                reader.onload = function(event) {
                                    try {
                                        let binaryStr = "";
                                        const bytes = new Uint8Array(event.target.result);
                                        for (let i = 0; i < bytes.byteLength; i++) {
                                            binaryStr += String.fromCharCode(bytes[i]);
                                        }
                                        const base64Content = btoa(binaryStr);

                                        const sActionName = "com.sap.gateway.srvd.zsd_gr_request.v0001.uploadFile";
                                        let aParams = [];
                                        aParams.push({
                                            name: "file_name",
                                            value: sap.ui.getCore().byId("fileUploader").getValue()
                                        });
                                        aParams.push({
                                            name: "mime_type",
                                            value: sap.ui.getCore().byId("fileUploader").getMimeType()[0]
                                        });
                                        aParams.push({
                                            name: "file_content",
                                            value: base64Content
                                        });

                                        const oContext = this._controller.getExtensionAPI()
                                            .getModel()
                                            .bindContext("/ZP_GR_REQUEST_HEAD")
                                            .getBoundContext();

                                        let oActionParams = {
                                            contexts: oContext,
                                            label: "Upload",
                                            invocationGrouping: "ChangeSet",
                                            parameterValues: aParams,
                                            skipParameterDialog: true
                                        };

                                        this.editFlow.invokeAction(sActionName, oActionParams)
                                            .then(() => {
                                                sap.m.MessageToast.show("File uploaded successfully");
                                                sap.ui.getCore().byId("fileUploader").clear();
                                            })
                                            .catch(err => {
                                                Log.error(err?.message);
                                                sap.ui.getCore().byId("fileUploader").clear();
                                            });

                                    } catch (err) {
                                        MessageToast.show("Error reading Pdf file: " + err.message);
                                    }
                                }.bind(this);

                                reader.readAsArrayBuffer(
                                    sap.ui.getCore().byId("fileUploadButton")
                                        .getAggregation("customData")[0]
                                        .getValue()
                                );

                                this.pDialog.close();
                            }.bind(this)
                        }),
                        new sap.m.Button({
                            id: "fileCloseButton",
                            text: "Close",
                            press: function() {
                                sap.ui.getCore().byId("fileUploader").clear();
                                this.pDialog.close();
                            }.bind(this)
                        })
                    ]
                });

                let oForm = new sap.ui.layout.form.SimpleForm({
                    editable: true,
                    layout: "ResponsiveGridLayout",
                    labelSpanM: 3,
                    labelSpanS: 2,
                    adjustLabelSpan: false,
                    emptySpanXL: 4,
                    emptySpanL: 4,
                    emptySpanM: 3,
                    emptySpanS: 2,
                    columnsM: 1,
                    content: [
                        new sap.ui.layout.VerticalLayout({
                            width: "100%",
                            content: [
                                new sap.m.Label({
                                    text: "File",
                                    labelFor: "fileUploader",
                                    required: true
                                }),
                                new sap.ui.unified.FileUploader({
                                    id: "fileUploader",
                                    placeholder: "Select a .pdf file",
                                    fileType: "pdf",
                                    mimeType: "application/pdf",
                                    sameFilenameAllowed: true,
                                    change: function(e) {
                                        e.getSource().setValueState("None");
                                        sap.ui.getCore().byId("fileUploadButton")
                                            .data("file", e.getParameter("files")[0]);
                                    }
                                })
                            ]
                        }).addStyleClass("sapUiNoMarginBegin")
                    ]
                });

                this.pDialog.addContent(oForm);
                this._view.addDependent(this.pDialog);
            }
            this.pDialog.open();
        },
        onCloseDialog: function() {
            this._pDialog.then(function(oDialog) {
                oDialog.close();
            });
        }
    };
});