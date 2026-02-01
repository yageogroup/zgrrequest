sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zgrrequest',
            componentId: 'ZP_GR_REQUEST_HEADList',
            contextPath: '/ZP_GR_REQUEST_HEAD'
        },
        CustomPageDefinitions
    );
});