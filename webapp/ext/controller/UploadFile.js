sap.ui.define([
        "sap/m/MessageToast",
        "sap/m/MessageBox"
], function (MessageToast, MessageBox) {
        'use strict';

        return {
                _pDialog: null,
                _valueHelpDialog: null,
                /**
                         * Generated event handler.
                                  *
                                           * @param oContext the context of the page on which the event was fired. `undefined` for list report page.
                                                    * @param aSelectedContexts the selected contexts of the table rows.
                                                             */
                uploadHandler: function (oContext, aSelectedContexts) {

                        if (!this.pDialog) {
                                this.pDialog = new sap.m.Dialog({
                                        id: "uploadDialogBox",
                                        title: "Upload File",
                                        buttons: [
                                                new sap.m.Button({
                                                        id: "fileUploadButton",
                                                        text: "Upload",
                                                        press: function () {
                                                                //     if (sap.ui.getCore().byId('idVendorInput').getValue() === '') {
                                                                //     MessageToast.show("Please select a vendor number.");
                                                                //         sap.ui.getCore().byId('idVendorInput').setValueState("Error");
                                                                //         return;
                                                                //      }
                                                                if (sap.ui.getCore().byId('fileUploader').getValue() === '') {
                                                                        MessageToast.show("Please select a file first.");
                                                                        sap.ui.getCore().byId('fileUploader').setValueState("Error");
                                                                        return;
                                                                }

                                                                const oReader = new FileReader();
                                                                oReader.onload = function (e) {
                                                                        try {
                                                                                let binary = "";
                                                                                const bytes = new Uint8Array(e.target.result);

                                                                                for (let i = 0; i < bytes.byteLength; i++) {
                                                                                        binary += String.fromCharCode(bytes[i]);
                                                                                }
                                                                                // Array buffer to Base64 coversion
                                                                                const sBase64 = btoa(binary);

                                                                                // Call static rap action upload file
                                                                                let sActionName = "com.sap.gateway.srvd.zsd_gr_request.v0001.uploadFile";
                                                                                let parameters = [];
                                                                                parameters.push({ name: "vendor_no", value: sap.ui.getCore().byId('idVendorInput').getValue() });
                                                                                parameters.push({ name: "file_name", value: sap.ui.getCore().byId('fileUploader').getValue() });
                                                                                parameters.push({ name: "mime_type", value: sap.ui.getCore().byId('fileUploader').getMimeType()[0] });
                                                                                parameters.push({ name: "file_content", value: sBase64 });
                                                                                const oContext = this._controller.getExtensionAPI().getModel().bindContext("/ZP_GR_REQUEST_HEAD").getBoundContext();
                                                                                let mParameters = {
                                                                                        contexts: oContext,
                                                                                        label: 'Upload',
                                                                                        invocationGrouping: "ChangeSet",
                                                                                        parameterValues: parameters,
                                                                                        skipParameterDialog: true
                                                                                };
                                                                                this.editFlow.invokeAction(sActionName, mParameters).then(() => {
                                                                                        sap.m.MessageToast.show("File uploaded successfully");
                                                                                        sap.ui.getCore().byId('idVendorInput').setValue('');
                                                                                        sap.ui.getCore().byId('fileUploader').clear();
                                                                                }).catch((oError) => {
                                                                                        MessageBox.error(oError?.message);
                                                                                        sap.ui.getCore().byId('idVendorInput').setValue('');
                                                                                        sap.ui.getCore().byId('fileUploader').clear();
                                                                                });
                                                                        } catch (error) {
                                                                                MessageToast.show("Error reading Pdf file: " + error.message);
                                                                        }
                                                                }.bind(this);
                                                                oReader.readAsArrayBuffer(sap.ui.getCore().byId('fileUploadButton').getAggregation('customData')[0].getValue());
                                                                this.pDialog.close();
                                                        }.bind(this)
                                                }),
                                                new sap.m.Button({
                                                        id: "fileCloseButton",
                                                        text: "Close",
                                                        press: function () {
                                                                sap.ui.getCore().byId('idVendorInput').setValue('');
                                                                sap.ui.getCore().byId('fileUploader').clear();
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
                                                                        text: "Vendor No.",
                                                                        labelFor: "idVendorInput",
                                                                        labelFor: "idVendorInput",
                                                                        required: false
                                                                }),
                                                                new sap.m.Input({
                                                                        id: "idVendorInput",
                                                                        placeholder: "Enter Vendor No.",
                                                                        showSuggestion: true,
                                                                        showValueHelp: true,
                                                                        valueLiveUpdate: true,
                                                                        valueHelpOnly: true,
                                                                        suggestionItems: {
                                                                                path: "/I_Supplier_VH",
                                                                                template: new sap.ui.core.Item({
                                                                                        key: "{Supplier}",
                                                                                        text: "{Supplier} - {SupplierName}"
                                                                                })
                                                                        },
                                                                        liveChange: function (oEvent) {
                                                                                oEvent.getSource().setValueState("None");
                                                                        },
                                                                        valueHelpRequest: function (oEvent) {
                                                                                if (!this._valueHelpDialog) {
                                                                                        this._valueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
                                                                                                title: "Select Vendor",
                                                                                                supportMultiselect: false,
                                                                                                supportRanges: false,
                                                                                                key: "Supplier",
                                                                                                descriptionKey: "SupplierName",
                                                                                                ok: function (oEvent) {
                                                                                                        if (oEvent.getParameter("tokens").length) {
                                                                                                                sap.ui.getCore().byId("idVendorInput").setValue(oEvent.getParameter("tokens")[0].getKey());
                                                                                                                this._valueHelpDialog.close();
                                                                                                        }
                                                                                                }.bind(this),
                                                                                                cancel: function () {
                                                                                                        this._valueHelpDialog.close();
                                                                                                }.bind(this)
                                                                                        })
                                                                                        sap.ui.getCore().byId("uploadDialogBox").addDependent(this._valueHelpDialog);

                                                                                        this._valueHelpDialog.getTableAsync().then(function (oTable) {

                                                                                                oTable.setModel(sap.ui.getCore().byId("uploadDialogBox").getParent().getModel());

                                                                                                if (oTable.bindRows) {
                                                                                                        // Desktop (sap.ui.table.Table)
                                                                                                        oTable.addColumn(new sap.ui.table.Column({
                                                                                                                label: "Vendor",
                                                                                                                template: new sap.m.Text({ text: "{Supplier}" })
                                                                                                        }));

                                                                                                        oTable.addColumn(new sap.ui.table.Column({
                                                                                                                label: "Vendor Name",
                                                                                                                template: new sap.m.Text({ text: "{SupplierName}" })
                                                                                                        }));

                                                                                                        oTable.bindRows("/I_Supplier_VH");

                                                                                                } else {
                                                                                                        // Mobile (sap.m.Table)
                                                                                                        oTable.addColumn(new sap.m.Column({
                                                                                                                header: new sap.m.Label({ text: "Vendor" })
                                                                                                        }));

                                                                                                        oTable.addColumn(new sap.m.Column({
                                                                                                                header: new sap.m.Label({ text: "Vendor Name" })
                                                                                                        }));

                                                                                                        oTable.bindItems({
                                                                                                                path: "/I_Supplier_VH",
                                                                                                                template: new sap.m.ColumnListItem({
                                                                                                                        cells: [
                                                                                                                                new sap.m.Text({ text: "{Supplier}" }),
                                                                                                                                new sap.m.Text({ text: "{SupplierName}" })
                                                                                                                        ]
                                                                                                                })
                                                                                                        });
                                                                                                }
                                                                                                this._valueHelpDialog.update();
                                                                                        }.bind(this));

                                                                                        this._valueHelpDialog.setFilterBar(
                                                                                                new sap.ui.comp.filterbar.FilterBar({
                                                                                                        advancedMode: true,
                                                                                                        filterBarExpanded: true,
                                                                                                        showGoOnFB: false,
                                                                                                        basicSearch: new sap.m.SearchField({
                                                                                                                width: "100%",
                                                                                                                liveChange: function (oEvent) {
                                                                                                                        var sValue = oEvent.getSource().getValue();

                                                                                                                        this._valueHelpDialog.getTableAsync().then(function (oTable) {

                                                                                                                                var oBinding = oTable.getBinding(
                                                                                                                                        oTable.bindRows ? "rows" : "items"
                                                                                                                                );

                                                                                                                                if (!oBinding) {
                                                                                                                                        return;
                                                                                                                                }

                                                                                                                                var oFilter = new sap.ui.model.Filter({
                                                                                                                                        filters: [
                                                                                                                                                new sap.ui.model.Filter("Supplier", sap.ui.model.FilterOperator.Contains, sValue),
                                                                                                                                                new sap.ui.model.Filter("SupplierName", sap.ui.model.FilterOperator.Contains, sValue)
                                                                                                                                        ],
                                                                                                                                        and: false
                                                                                                                                });

                                                                                                                                oBinding.filter(oFilter);
                                                                                                                        });
                                                                                                                }.bind(this)
                                                                                                        })
                                                                                                })
                                                                                        )
                                                                                }
                                                                                this._valueHelpDialog.open();
                                                                        },
                                                                }),
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
                                                                        change: function (oEvent) {
                                                                                oEvent.getSource().setValueState("None");
                                                                                sap.ui.getCore().byId('fileUploadButton').data("file", oEvent.getParameter("files")[0]);
                                                                        }
                                                                })
                                                        ]
                                                }).addStyleClass("sapUiNoMarginBegin")
                                        ]
                                });
                                this.pDialog.addContent(oForm);

                                // Ensure the dialog is added to the view's dependent aggregation for lifecycle management
                                this._view.addDependent(this.pDialog);
                        }
                        this.pDialog.open();
                },

                onCloseDialog: function () {
                        this._pDialog.then(function (oDialog) {
                                oDialog.close();
                        });
                }
        };
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                