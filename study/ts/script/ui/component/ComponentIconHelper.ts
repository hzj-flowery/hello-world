import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import CommonIconBase from "./CommonIconBase";

export var ComponentIconHelper: any = {};
ComponentIconHelper._setPostion = function (params, posDesc) {
    var position = cc.v2(0, 0);
    var anchorPoint = cc.v2(0, 0);
    if (posDesc == 'leftBottom') {
        position = cc.v2(-41, -41);
        anchorPoint = cc.v2(0, 0);
    }
    if (posDesc == 'leftTop') {
        position = cc.v2(-41, 46);
        anchorPoint = cc.v2(0, 1);
    }
    if (posDesc == 'midTop') {
        position = cc.v2(1, 39);
        anchorPoint = cc.v2(0.5, 1);
    }
    if (posDesc == 'midcenter') {
        position = cc.v2(0, 0);
        anchorPoint = cc.v2(0.5, 0.5);
    }
    if (posDesc == 'rightBottom') {
        position = cc.v2(39, -46);
        anchorPoint = cc.v2(1, 0);
    }
    if (posDesc == 'midEnd') {
        position = cc.v2(1, -52);
        anchorPoint = cc.v2(0.5, 1);
    }
    if (posDesc == 'leftTop2') {
        position = cc.v2(-28, 26);
        anchorPoint = cc.v2(0.5, 0.5);
    }
    if (posDesc == 'selectIcon') {
        position = cc.v2(0, 0);
        anchorPoint = cc.v2(0.5, 0.5);
    }
    params.position = position;
    params.anchorPoint = anchorPoint;
};
ComponentIconHelper.buildItemContentPanel = function () {
    var params = {
        name: '_panelItemContent',
        contentSize: cc.size(98, 98),
        anchorPoint: cc.v2(0.5, 0.5),
        position: cc.v2(0, 0)
    };
    var panelItemContent = UIHelper.createPanel(params);
    return panelItemContent;
};
ComponentIconHelper.createIcon = function (type, value?, size?):cc.Node {
    var className = TypeConvertHelper.getTypeClass(type);
    var iconNode = UIHelper.createBaseIcon(type);
    if (className) {
        // if (true) {   //cc.isRegister(className)
        //   //  console.debug('ComponentIconHelper.createIcon bind icon class name : ' + className);
        //     iconNode.addComponent(className);
        // }
        var comp = iconNode.addComponent(className) as CommonIconBase;
        comp.onLoad();
        if (value && value > 0) {
            if (type == TypeConvertHelper.TYPE_HEAD_FRAME || type == TypeConvertHelper.TYPE_TITLE) {
                size = 1 * (100 / 130);
            }
            // var comp = iconNode.getComponent(className) as CommonIconBase;
            comp._type = type;
            comp.updateUI(value, size);
            comp.isClickFrame();
        }
    } else {
        iconNode.addComponent('CommonDefaultIcon');
        console.log('ComponentIconHelper.createIcon className:'+className);
    }
    return iconNode;
};

///////////////// unfinished