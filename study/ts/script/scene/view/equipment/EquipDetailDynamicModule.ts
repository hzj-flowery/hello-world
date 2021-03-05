import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import CommonMasterInfoNode from "../../../ui/component/CommonMasterInfoNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipDetailDynamicModule extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;


    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _commonDetailTitleWithBg: CommonDetailTitleWithBg = null;

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _commonButtonLevel2Highlight: CommonButtonLevel2Highlight = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _commonDesValue: CommonDesValue = null;

    @property({
        type: CommonMasterInfoNode,
        visible: true
    })
    _commonMasterInfoNode: CommonMasterInfoNode = null;

}