sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zgrrequest',
            componentId: 'ZP_GR_REQUEST_HEADObjectPage',
            contextPath: '/ZP_GR_REQUEST_HEAD'
        },
        CustomPageDefinitions
    );
});