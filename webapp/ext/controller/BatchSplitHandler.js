sap.ui.define([
  "sap/m/Dialog",
  "sap/m/Table",
  "sap/m/Column",
  "sap/m/ColumnListItem",
  "sap/m/Input",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/HBox",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/DatePicker",
  "sap/m/SelectDialog",
  "sap/m/StandardListItem",
  "sap/ui/core/ListItem",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Dialog, Table, Column, ColumnListItem, Input, Label, Button, HBox,
              MessageToast, MessageBox, DatePicker, SelectDialog, StandardListItem,
              ListItem, JSONModel, Filter, FilterOperator) {
  "use strict";

  var ITEM_PLANT_PROPERTY = "Werks";               // plant field on ZP_GR_REQUEST_ITEM (oContext)
  var ITEM_SLOC_PROPERTY  = "Lgort";               // storage location field on ZP_GR_REQUEST_ITEM
  var ITEM_MANF_PROPERTY  = "Hsdat";               // manufacturing date on ZP_GR_REQUEST_ITEM
  var ITEM_EXPIRY_PROPERTY = "Vfdat";              // expiry date on ZP_GR_REQUEST_ITEM
  var VH_PLANT_PROPERTY   = "Plant";               // plant field on the value help entity
  var SLOC_VH_ENTITY      = "/StorageLocationVH";  // exposed in SRVD zsd_gr_request
  var DATE_FORMAT         = "yyyyMMdd";            // ABAP DATS format sent to backend

  // OData V4 Edm.Date "2026-09-28" -> "20260928"; empty/null -> null
  function toDats(vDate) {
    if (!vDate) {
      return null;
    }
    var s = String(vDate).replace(/-/g, "");
    return (s && s !== "00000000") ? s : null;
  }

  return {
    BatchSplit: function (oContext, aSelectedContexts) {

      var oODataModel     = oContext.getModel();
      var sPlant          = oContext.getProperty(ITEM_PLANT_PROPERTY) || "";
      var sDefaultSloc    = oContext.getProperty(ITEM_SLOC_PROPERTY)  || "";
      var sDefaultManf    = toDats(oContext.getProperty(ITEM_MANF_PROPERTY));
      var sDefaultExpiry  = toDats(oContext.getProperty(ITEM_EXPIRY_PROPERTY));

      // every new row starts with the item's values from the backend
      function newRow() {
        return {
          qty:             "",
          storageLocation: sDefaultSloc,
          batch:           "",
          manfDate:        sDefaultManf,
          expiryDate:      sDefaultExpiry
        };
      }

      var oRowsModel = new JSONModel({ rows: [ newRow() ] });

      function addRow(iAfterIndex) {
        var aRows = oRowsModel.getProperty("/rows");
        if (iAfterIndex === undefined || iAfterIndex === aRows.length - 1) {
          aRows.push(newRow());
        } else {
          aRows.splice(iAfterIndex + 1, 0, newRow());
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

      // --- Storage location filters ------------------------------------
      function getPlantFilters() {
        return sPlant ? [ new Filter(VH_PLANT_PROPERTY, FilterOperator.EQ, sPlant) ] : [];
      }

      function getSearchFilters(sValue) {
        var aFilters = getPlantFilters();
        sValue = (sValue || "").trim();
        if (sValue) {
          aFilters.push(new Filter({
            filters: [
              // codes are upper case -> no tolower() needed
              new Filter("StorageLocation",     FilterOperator.Contains, sValue.toUpperCase()),
              new Filter("StorageLocationName", FilterOperator.Contains, sValue)
            ],
            and: false
          }));
        }
        return aFilters;
      }

      // --- Storage location value help dialog --------------------------
      var oCurrentSlocInput = null;

      var oSlocVH = new SelectDialog({
        title: "Select Storage Location",
        items: {
          path: SLOC_VH_ENTITY,
          parameters: { $$operationMode: "Server" },
          filters: getPlantFilters(),
          template: new StandardListItem({
            title: "{StorageLocation}",
            description: "{StorageLocationName}",
            info: "{Plant}"
          })
        },
        search: function (oEvt) {
          oEvt.getSource().getBinding("items").filter(getSearchFilters(oEvt.getParameter("value")));
        },
        liveChange: function (oEvt) {
          oEvt.getSource().getBinding("items").filter(getSearchFilters(oEvt.getParameter("value")));
        },
        confirm: function (oEvt) {
          var oItem = oEvt.getParameter("selectedItem");
          if (oItem && oCurrentSlocInput) {
            oCurrentSlocInput.setValue(oItem.getTitle());   // two-way -> row model
          }
          oCurrentSlocInput = null;
        },
        cancel: function () {
          oCurrentSlocInput = null;
        }
      });
      oSlocVH.setModel(oODataModel);

      // --- Table -------------------------------------------------------
      var oTable = new Table({
        columns: [
          new Column({ header: new Label({ text: "Qty", required: true }) }),
          new Column({ header: new Label({ text: "Storage Location" }) }),
          new Column({ header: new Label({ text: "Batch" }) }),
          new Column({ header: new Label({ text: "Manf Date" }) }),
          new Column({ header: new Label({ text: "Expiry Date" }) }),
          new Column({ header: new Label({ text: "" }), hAlign: "Center", width: "90px" })
        ]
      });

      oTable.bindItems({
        path: "/rows",
        template: new ColumnListItem({
          cells: [
            // Qty
            new Input({ value: "{qty}", type: "Number" }),

            // Storage Location
            new Input({
              value: "{storageLocation}",
              showValueHelp: true,
              showSuggestion: true,
              startSuggestion: 1,
              maxLength: 4,
              suggestionItems: {
                path: "odata>" + SLOC_VH_ENTITY,
                parameters: { $$operationMode: "Server" },
                length: 20,
                filters: getPlantFilters(),
                template: new ListItem({
                  key: "{odata>StorageLocation}",
                  text: "{odata>StorageLocation}",
                  additionalText: "{odata>StorageLocationName}"
                })
              },
              suggest: function (oEvt) {
                var sValue = (oEvt.getParameter("suggestValue") || "").toUpperCase();
                var aFilters = getPlantFilters();
                if (sValue) {
                  aFilters.push(new Filter("StorageLocation", FilterOperator.StartsWith, sValue));
                }
                oEvt.getSource().getBinding("suggestionItems").filter(aFilters);
              },
              suggestionItemSelected: function (oEvt) {
                var oItem = oEvt.getParameter("selectedItem");
                if (oItem) {
                  oEvt.getSource().setValue(oItem.getKey());
                }
              },
              valueHelpRequest: function (oEvt) {
                oCurrentSlocInput = oEvt.getSource();
                var sTyped = oCurrentSlocInput.getValue();
                oContext.requestProperty(ITEM_PLANT_PROPERTY).then(function (sWerks) {
                  sPlant = sWerks || "";
                  oSlocVH.getBinding("items").filter(getSearchFilters(sTyped));
                  oSlocVH.open(sTyped);
                });
              },
              change: function (oEvt) {
                var oInput = oEvt.getSource();
                oInput.setValue((oInput.getValue() || "").toUpperCase());
              }
            }),

            // Batch
            new Input({ value: "{batch}" }),

            // Manf Date / Expiry Date
            new DatePicker({ value: "{manfDate}",   valueFormat: DATE_FORMAT, displayFormat: "medium" }),
            new DatePicker({ value: "{expiryDate}", valueFormat: DATE_FORMAT, displayFormat: "medium" }),

            // +/- row actions
            new HBox({
              items: [
                new Button({
                  icon: "sap-icon://add",
                  type: "Transparent",
                  tooltip: "Add row",
                  press: function (oEvt) {
                    var oItem = oEvt.getSource().getParent().getParent();
                    addRow(oTable.getItems().indexOf(oItem));
                  }
                }),
                new Button({
                  icon: "sap-icon://less",
                  type: "Transparent",
                  tooltip: "Remove row",
                  press: function (oEvt) {
                    var oItem = oEvt.getSource().getParent().getParent();
                    removeRow(oTable.getItems().indexOf(oItem));
                  }
                })
              ]
            })
          ]
        })
      });
      oTable.setModel(oRowsModel);             // default model: dialog rows
      oTable.setModel(oODataModel, "odata");   // named model: suggestions

      // --- Dialog --------------------------------------------------------
      var oDialog = new Dialog({
        title: "Batch Split",
        contentWidth: "750px",
        content: [oTable],
        beginButton: new Button({
          text: "Confirm",
          type: "Emphasized",
          press: function () {
            var aRows = oRowsModel.getProperty("/rows");

            // Only Qty is required
            var bValid = aRows.every(function (r) {
              return r.qty;
            });
            if (!bValid) {
              MessageBox.warning("Please fill Qty for every row before confirming.");
              return;
            }

            // yyyyMMdd strings compare correctly as text
            var bDatesOk = aRows.every(function (r) {
              return !r.manfDate || !r.expiryDate || r.expiryDate >= r.manfDate;
            });
            if (!bDatesOk) {
              MessageBox.warning("Expiry Date cannot be before Manf Date.");
              return;
            }

            var oActionCtx = oODataModel.bindContext(
              "com.sap.gateway.srvd.zsd_gr_request.v0001.batchSplit(...)",
              oContext
            );
            oActionCtx.setParameter("dummyKey", "X");
            oActionCtx.setParameter("rowsJson", JSON.stringify(aRows.map(function (r) {
              return {
                batchNo:         r.batch || "",
                splitQty:        r.qty,
                storageLocation: r.storageLocation || "",
                manfDate:        r.manfDate   || "",   // "20260928" or empty
                expiryDate:      r.expiryDate || ""
              };
            })));

            oActionCtx.execute().then(function () {
              MessageToast.show("Batch split completed for " + aRows.length + " line(s)");
              oDialog.close();

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

      oDialog.addDependent(oSlocVH);   // destroyed together with the dialog

      // Load plant, storage location and dates from the backend before opening
      Promise.all([
        oContext.requestProperty(ITEM_PLANT_PROPERTY),
        oContext.requestProperty(ITEM_SLOC_PROPERTY),
        oContext.requestProperty(ITEM_MANF_PROPERTY),
        oContext.requestProperty(ITEM_EXPIRY_PROPERTY)
      ]).then(function (aValues) {
        sPlant         = aValues[0] || sPlant;
        sDefaultSloc   = aValues[1] || sDefaultSloc;
        sDefaultManf   = toDats(aValues[2]) || sDefaultManf;
        sDefaultExpiry = toDats(aValues[3]) || sDefaultExpiry;
        oRowsModel.setProperty("/rows", [ newRow() ]);   // first row with the defaults
        oDialog.open();
      }).catch(function () {
        oDialog.open();                                  // open anyway, just without defaults
      });
    }
  };
});