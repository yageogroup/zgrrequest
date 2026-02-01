sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheZP_GR_REQUEST_HEADList.iSeeThisPage();

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheZP_GR_REQUEST_HEADList.onFilterBar().iExecuteSearch();
            
            Then.onTheZP_GR_REQUEST_HEADList.onTable().iCheckRows();

            When.onTheZP_GR_REQUEST_HEADList.onTable().iPressRow(0);
            Then.onTheZP_GR_REQUEST_HEADObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});