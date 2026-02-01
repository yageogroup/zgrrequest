sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"zgrrequest/test/integration/pages/ZP_GR_REQUEST_HEADList",
	"zgrrequest/test/integration/pages/ZP_GR_REQUEST_HEADObjectPage"
], function (JourneyRunner, ZP_GR_REQUEST_HEADList, ZP_GR_REQUEST_HEADObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('zgrrequest') + '/test/flp.html#app-preview',
        pages: {
			onTheZP_GR_REQUEST_HEADList: ZP_GR_REQUEST_HEADList,
			onTheZP_GR_REQUEST_HEADObjectPage: ZP_GR_REQUEST_HEADObjectPage
        },
        async: true
    });

    return runner;
});

