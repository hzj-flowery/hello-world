import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import CommonAttrNode from "../../../ui/component/CommonAttrNode";
import { Lang } from "../../../lang/Lang";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
const { ccclass, property } = cc._decorator;

@ccclass
export default class InstrumentLimitDetailAttrNode extends ListViewCellBase{

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle1: CommonDetailTitleWithBg = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1_1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1_2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1_3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1_4: CommonAttrNode = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle2: CommonDetailTitleWithBg = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2_1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2_2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2_3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2_4: CommonAttrNode = null;
    
    _level: any;
    _templateId1: any;
    _templateId2: any;
    
    ctor(level, templateId1, templateId2) {
        this._level = level;
        this._templateId1 = templateId1;
        this._templateId2 = templateId2;
    }
    onInit(){
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
    }
    onCreate() {
        for (var i = 1; i<=2; i++) {
            this._update(this._level, i);
        }
    }
    _update(level, index) {
        this['_nodeTitle' + index].setFontSize(24);
        this['_nodeTitle' + index].setTitle(Lang.get('instrument_detail_title_attr'));
        var templateId = this['_templateId' + index];
        var attrInfo = InstrumentDataHelper.getInstrumentLevelAttr(level, templateId);
        var infos = TextHelper.getAttrInfoBySort(attrInfo);
        for (var i = 1; i<=4; i++) {
            var info = infos[i-1];
            if (info) {
                this['_nodeAttr' + (index + ('_' + i))].setVisible(true);
                this['_nodeAttr' + (index + ('_' + i))].updateView(info.id, info.value, null, 4);
            } else {
                this['_nodeAttr' + (index + ('_' + i))].setVisible(false);
            }
        }
    }
}
