import ListViewCellBase from "../../../ui/ListViewCellBase";
import { TreasureUnitData } from "../../../data/TreasureUnitData";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";
import { Colors, G_SceneManager } from "../../../init";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import UIHelper from "../../../utils/UIHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import CommonMasterInfoNode from "../../../ui/component/CommonMasterInfoNode";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import { handler } from "../../../utils/handler";
import { FunctionConst } from "../../../const/FunctionConst";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { TreasureTrainHelper } from "../treasureTrain/TreasureTrainHelper";
import TreasureConst from "../../../const/TreasureConst";

const { ccclass, property } = cc._decorator;


@ccclass
export default class TreasureDetailStrengthenNode extends CommonDetailDynamicModule {
    @property({
        type: cc.Prefab,
        visible: true
    })    
    _CommonDetailTitleWithBg:cc.Prefab = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode:cc.Node = null;

    @property(cc.Prefab)
    commonDesValue:cc.Prefab = null;

    @property(cc.Prefab)
    commonMasterInfoNode:cc.Prefab = null;

    @property(cc.Prefab)
    commonButtonLevel2Highlight:cc.Prefab = null;

    private _treasureData:TreasureUnitData;
    _rangeType;

    ctor(treasureData, rangeType) {
        this._treasureData = treasureData;
        this._rangeType = rangeType;
        this.node.name = ('TreasureDetailStrengthenNode');
        this.onInit();
    }
    onInit() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var offset = 0;
        if (this._treasureData.isUserTreasure()) {
            var btnWidget = this._createButton();
            this._listView.pushBackCustomItem(btnWidget);
        } else {
            offset = 10;
        }
        var level = this._createLevelDes();
        this._listView.pushBackCustomItem(level);
        var attr = this._createAttrDes();
        this._listView.pushBackCustomItem(attr);
        var master = this._createMasterDes();
        if (master) {
            this._listView.pushBackCustomItem(master);
        }
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        contentSize.height = contentSize.height + offset;
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var title = cc.instantiate(this._CommonDetailTitleWithBg).getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('treasure_detail_title_strengthen'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 50);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, 30);
        widget.addChild(title.node);
        return widget;
    }
    _createLevelDes() {
        var widget = new cc.Node();
        var node = cc.instantiate(this.commonDesValue).getComponent(CommonDesValue);
        var des = Lang.get('treasure_detail_strengthen_level');
        var value = this._treasureData.getLevel();
        var max = this._treasureData.getMaxStrLevel();
        var color = value < max && Colors.BRIGHT_BG_ONE || Colors.BRIGHT_BG_GREEN;
        node.setFontSize(20);
        node.updateUI(des, value, max);
        node.setValueColor(color);
        node.setMaxColor(color);
        node.node.setPosition(24, 20);
        widget.addChild(node.node);
        widget.setContentSize(cc.size(402, 30));
        return widget;
    }
    _createAttrDes() {
        var widget = new cc.Node();
        var attrInfo = UserDataHelper.getTreasureStrengthenAttr(this._treasureData) || {};
        for (let k in attrInfo) {
            var value = attrInfo[k];
            var [name, value] = TextHelper.getAttrBasicText(k, value);
            name = TextHelper.expandTextByLen(name, 4);
            var node = cc.instantiate(this.commonDesValue).getComponent(CommonDesValue);
            node.setFontSize(20);
            node.updateUI(name + '\uFF1A', value);
            node.node.setPosition(24, 20);
            widget.addChild(node.node);
            break;
        }
        widget.setContentSize(cc.size(402, 30));
        return widget;
    }
    _createMasterDes() {
        var pos = this._treasureData.getPos();
        var info = UserDataHelper.getMasterTreasureUpgradeInfo(pos);
        var level = info.curMasterLevel;
        if (level <= 0) {
            return null;
        }
        var widget = new cc.Node();
        var master = cc.instantiate(this.commonMasterInfoNode).getComponent(CommonMasterInfoNode);
        var title = Lang.get('treasure_datail_strengthen_master', { level: level });
        var attrInfo = info.curAttr;
        var line = master.updateUI(title, attrInfo);
        widget.addChild(master.node);
        var size = master.getContentSize();
        widget.setContentSize(size);
        return widget;
 
    }
    _createButton() {
        var widget = new cc.Node();
        var btn = cc.instantiate(this.commonButtonLevel2Highlight).getComponent(CommonButtonLevel2Highlight);
        btn.setString(Lang.get('treasure_detail_btn_strengthen'));
        btn.node.name = ('ButtonStrengthen');
        btn.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked));
        widget.addChild(btn.node);
        var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, 'slotRP', this._treasureData);
        btn.showRedPoint(reach);
        btn.node.setPosition(324, -27);
        widget.setContentSize(cc.size(402, 1));
        return widget;
    }
    _onButtonStrengthenClicked() {
        if (TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1) == false) {
            return;
        }
        var treasureId = this._treasureData.getId();
        G_SceneManager.showScene('treasureTrain', treasureId, TreasureConst.TREASURE_TRAIN_STRENGTHEN, this._rangeType, true);
    }
}
