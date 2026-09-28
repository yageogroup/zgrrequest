sap.ui.define([
  "sap/m/Dialog",
  "sap/m/Table",
  "sap/m/Column",
  "sap/m/ColumnListItem",
  "sap/m/Input",
  "sap/m/Text",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/HBox",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/DatePicker",
  "sap/ui/model/json/JSONModel"
], function (Dialog, Table, Column, ColumnListItem, Input, Text, Label, Button, HBox,
              MessageToast, MessageBox, DatePicker, JSONModel) {
  "use strict";

  return {
    BatchSplit: function (oContext, aSelectedContexts) {

      // Model driving the editable rows. Each row: batch, qty, uom, manfDate, expiryDate
      var oRowsModel = new JSONModel({
        rows: [
          { batch: "", qty: "", uom: "", manfDate: null, expiryDate: null }
        ]
      });

      function addRow(iAfterIndex) {
        var aRows = oRowsModel.getProperty("/rows");
        var oNewRow = { batch: "", qty: "", uom: "", manfDate: null, expiryDate: null };
        if (iAfterIndex === undefined || iAfterIndex === aRows.length - 1) {
          aRows.push(oNewRow);
        } else {
          aRows.splice(iAfterIndex + 1, 0, oNewRow);
        }
        oRowsModel.setProperty("/rows", aRows);
      }

      function removeRow(iIndex) {
        var aRows = oRowsModel.getProperty("/rows");
        if (aRows.length > 1) {
          aRows.splice(iIndex, 1);
          oRowsModel.setProperty("/rows", aRows);
        }
      }

      // --- Table -------------------------------------------------------
      var oTable = new Table({
        columns: [
          new Column({ header: new Label({ text: "Batch" }) }),
          new Column({ header: new Label({ text: "Qty" }) }),
          new Column({ header: new Label({ text: "UoM" }) }),
          new Column({ header: new Label({ text: "Manf Date" }) }),
          new Column({ header: new Label({ text: "Expiry Date" }) }),
          new Column({ header: new Label({ text: "" }), hAlign: "Center", width: "90px" }) // +/- row actions
        ]
      });

      oTable.bindItems({
        path: "/rows",
        model: undefined, // uses default model set on the table below
        template: new ColumnListItem({
          cells: [
            new Input({ value: "{batch}" }),
            new Input({ value: "{qty}", type: "Number" }),
            new Input({ value: "{uom}" }),
            new DatePicker({ value: "{manfDate}", valueFormat: "yyyy-MM-dd", displayFormat: "medium" }),
            new DatePicker({ value: "{expiryDate}", valueFormat: "yyyy-MM-dd", displayFormat: "medium" }),
            new HBox({
              items: [
                new Button({
                  icon: "sap-icon://add",
                  type: "Transparent",
                  tooltip: "Add row",
                  press: function (oEvt) {
                    var oItem = oEvt.getSource().getParent().getParent();
                    var iIndex = oTable.getItems().indexOf(oItem);
                    addRow(iIndex);
                  }
                }),
                new Button({
                  icon: "sap-icon://less",
                  type: "Transparent",
                  tooltip: "Remove row",
                  press: function (oEvt) {
                    var oItem = oEvt.getSource().getParent().getParent();
                    var iIndex = oTable.getItems().indexOf(oItem);
                    removeRow(iIndex);
                  }
                })
              ]
            })
          ]
        })
      });
      oTable.setModel(oRowsModel);

      // --- Dialog --------------------------------------------------------
      var oDialog = new Dialog({
        title: "Batch Split",
        contentWidth: "700px",
        content: [oTable],
        beginButton: new Button({
          text: "Confirm",
          type: "Emphasized",
          press: function () {
            var aRows = oRowsModel.getProperty("/rows");

            // basic validation: batch + qty required on every row
            var bValid = aRows.every(function (r) {
              return r.batch && r.qty;
            });
            if (!bValid) {
              MessageBox.warning("Please fill Batch and Qty for every row before confirming.");
              return;
            }

            var oModel = oContext.getModel();
            var oActionCtx = oModel.bindContext(
              "com.sap.gateway.srvd.zsd_gr_request.v0001.batchSplit(...)",
              oContext
            );
            oActionCtx.setParameter("dummyKey", "X");
            oActionCtx.setParameter("rowsJson", JSON.stringify(aRows.map(function (r) {
              return {
                batchNo: r.batch,
                splitQty: r.qty,
                uom: r.uom,
                manfDate: r.manfDate,
                expiryDate: r.expiryDate
              };
            })));

            oActionCtx.execute().then(function () {
              MessageToast.show("Batch split completed for " + aRows.length + " batch(es)");
              oDialog.close();

              // Targeted context refresh wasn't picking up the change —
              // falling back to: navigate back, then force a full page
              // reload so the header page re-fetches everything from
              // scratch instead of reusing any cached binding/context.
              setTimeout(function () {
                window.history.back();
                setTimeout(function () {
                  window.location.reload();
                }, 300);
              }, 100);

            }).catch(function (oError) {
              MessageBox.error("Batch split failed: " + (oError.message || oError));
            });
          }
        }),
        endButton: new Button({
          text: "Cancel",
          press: function () { oDialog.close(); }
        }),
        afterClose: function () { oDialog.destroy(); }
      });

      oDialog.open();
    }
  };
});