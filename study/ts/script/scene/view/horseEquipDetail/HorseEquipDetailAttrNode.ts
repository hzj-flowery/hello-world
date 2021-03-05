const { ccclass, property } = cc._decorator;

import CommonAttrNode from '../../../ui/component/CommonAttrNode'
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { HorseEquipDataHelper } from '../../../utils/data/HorseEquipDataHelper';
import { TextHelper } from '../../../utils/TextHelper';

@ccclass
export default class HorseEquipDetailAttrNode extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCommon: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2: CommonAttrNode = null;

    private _equipData;
    private _rangeType;

    ctor(equipData, rangeType?) {
        this._equipData = equipData;
        this._rangeType = rangeType;
    }

    onInit() {
        var contentSize = this._panelBg.getContentSize();
        var posY = this._nodeCommon.y;
        this.node.setContentSize(contentSize);
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('horse_detail_title_attr'));
        this._updateAttrDes();
        this._nodeCommon.y = (posY);
    }

    _updateAttrDes() {
        var attrInfo = HorseEquipDataHelper.getHorseEquipAttrInfo(this._equipData);
        var desInfo = TextHelper.getAttrInfoBySort(attrInfo);
        for (var i = 1; i <= 2; i++) {
            var info = desInfo[i-1];
            if (info) {
                this['_nodeAttr' + i].updateView(info.id, info.value, null, 4);
                this['_nodeAttr' + i].setVisible(true);
            } else {
                this['_nodeAttr' + i].setVisible(false);
            }
        }
    }

}