sap.ui.define([
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (MessageToast, MessageBox) {
	'use strict';

	return {
		_pDialog: null,
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
											sap.ui.getCore().byId('fileUploader').clear();
										}).catch((oError) => {
											MessageBox.error(oError?.message);
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