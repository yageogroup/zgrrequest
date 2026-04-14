sap.ui.define([
    "sap/m/PDFViewer",
    "sap/m/MessageToast"
], function (PDFViewer, MessageToast) {
    "use strict";

    return {

        vfilefunc: function (oEvent) {

            // 🔹 Extract key
            var sPath = oEvent.sPath;
            var sMatch = sPath.match(/Grrequest='(.*?)'/);

            if (!sMatch) {
                MessageToast.show("Invalid path");
                return;
            }

            var sGrrequest = sMatch[1];

            var sUrl = `/sap/opu/odata4/sap/zui_gr_request/srvd/sap/zsd_gr_request/0001/ZP_GR_REQUEST_HEAD(Grrequest='${sGrrequest}',IsActiveEntity=true)/Content`;

            if (!this._pdfViewer) {
                this._pdfViewer = new sap.m.PDFViewer({
                    width: "100%",
                    height: "100%"
                });
            }

            this._pdfViewer.setSource(sUrl);
            this._pdfViewer.setTitle("PDF Preview");
            this._pdfViewer.open();
        }
    };
});