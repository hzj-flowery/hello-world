const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import CommonListItem from '../../../ui/component/CommonListItem';
import { G_UserData, Colors, G_SceneManager } from '../../../init';
import { TreasureData } from '../../../data/TreasureData';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { FunctionConst } from '../../../const/FunctionConst';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { TextHelper } from '../../../utils/TextHelper';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import { Lang } from '../../../lang/Lang';
import { TreasureDataHelper } from '../../../utils/data/TreasureDataHelper';
import { handler } from '../../../utils/handler';
import PopupTreasureDetail from '../treasureDetail/PopupTreasureDetail';
import TreasureConst from '../../../const/TreasureConst';
import ListViewCellBase from '../../../ui/ListViewCellBase';

@ccclass
export default class TreasureListCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item1: CommonListCellBase = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item2: CommonListCellBase = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen1: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen2: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLevel1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLevel2: cc.Sprite = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr1_1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr1_2: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2_1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2_2: CommonDesValue = null;

    _treasureId1;
    _treasureId2;

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    onLoad() {
        this._buttonStrengthen1.setString(Lang.get("treasure_btn_strengthen"));
        this._buttonStrengthen2.setString(Lang.get("treasure_btn_strengthen"));
        this._buttonStrengthen1.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked1));
        this._buttonStrengthen2.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked2));
    }

    updateUI(treasureId1, treasureId2) {
        this._treasureId1 = treasureId1;
        this._treasureId2 = treasureId2;
        this.updateCell(1, treasureId1);
        this.updateCell(2, treasureId2);
    }

    updateCell(index, treasureId) {
        if (!treasureId) {
            this['_item' + index].setVisible(false);
            return;
        }
        if (typeof (treasureId) != 'number') {
            return;
        }

        this['_item' + index].node.active = true;

        var data = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        var baseId = data.getBase_id();
        var level = data.getLevel();
        var rank = data.getRefine_level();

        this['_item' + index].updateUI(TypeConvertHelper.TYPE_TREASURE, baseId);
        this['_item' + index].setTouchEnabled(true);

        this["_item" + index].setCallBack(handler(this, this["_onClickIcon" + index]));

        var icon = this['_item' + index].getCommonIcon();
        var params = icon.getItemParams();

        UIHelper.loadTexture(this['_imageLevel' + index], Path.getUICommonFrame('img_iconsmithingbg_0' + params.color));
        this['_textLevel' + index].string = (level);
        this['_textLevel' + index].node.color = (Colors.getNumberColor(params.color));
        UIHelper.enableOutline(this['_textLevel' + index], Colors.getNumberColorOutline(params.color));
        this['_imageLevel' + index].node.active = (level > 0);
        this['_textRank' + index].string = ('+' + rank);
        this['_textRank' + index].node.active = (rank > 0);

        this._showAttrDes(index, data);

        var heroBaseId = TreasureDataHelper.getHeroBaseIdWithTreasureId(data.getId())[0];
        if (heroBaseId) {
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
            this['_textHeroName' + index].string = (heroParam.name);
            this['_textHeroName' + index].node.color = (heroParam.icon_color);
            UIHelper.updateTextOutline(this['_textHeroName' + index], heroParam);
            this['_textHeroName' + index].node.active = (true);
        } else {
            this['_textHeroName' + index].node.active = (false);
        }
    }


    _showAttrDes(index, data) {
        var info = TreasureDataHelper.getTreasureAttrInfo(data);
        var desInfo = TextHelper.getAttrInfoBySort(info);
        for (var i = 1; i <= 2; i++) {
            var one = desInfo[i - 1];
            if (one) {
                var arr = TextHelper.getAttrBasicText(one.id, one.value);
                var attrName = arr[0], attrValue = arr[1];
                attrName = TextHelper.expandTextByLen(attrName, 4);
                this['_nodeAttr' + (index + ('_' + i))].updateUI(attrName, '+' + attrValue);
                this['_nodeAttr' + (index + ('_' + i))].setValueColor(Colors.BRIGHT_BG_GREEN);
                this['_nodeAttr' + (index + ('_' + i))].node.active = (true);
            } else {
                this['_nodeAttr' + (index + ('_' + i))].node.active = (false);
            }
        }
    }

    _onButtonStrengthenClicked1() {
        this.dispatchCustomCallback(0)
    }

    _onButtonStrengthenClicked2() {
        this.dispatchCustomCallback(1)
    }

    _onClickIcon1(sender, itemParams) {
        if (itemParams.cfg.treasure_type == 0) {
            PopupTreasureDetail.loadCommonPrefab("PopupTreasureDetail", (popup: PopupTreasureDetail) => {
                popup.initData(TypeConvertHelper.TYPE_TREASURE, itemParams.cfg.id);
                popup.openWithAction();
            })
        } else {
            var treasureId = this._treasureId1
            G_SceneManager.showScene('treasureDetail', treasureId, TreasureConst.TREASURE_RANGE_TYPE_1)
        }
    }

    _onClickIcon2(sender, itemParams) {
        if (itemParams.cfg.treasure_type == 0) {
            PopupTreasureDetail.loadCommonPrefab("PopupTreasureDetail", (popup: PopupTreasureDetail) => {
                popup.initData(TypeConvertHelper.TYPE_TREASURE, itemParams.cfg.id);
                popup.openWithAction();
            })
        } else {
            var treasureId = this._treasureId2
            G_SceneManager.showScene('treasureDetail', treasureId, TreasureConst.TREASURE_RANGE_TYPE_1)
        }
    }

}