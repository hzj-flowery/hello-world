import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import UIHelper from "../../../utils/UIHelper";
import { RichTextHelper } from "../../../utils/RichTextHelper";
import { TextHelper } from "../../../utils/TextHelper";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";
import TreasureConst from "../../../const/TreasureConst";
import CommonDesValue from "../../../ui/component/CommonDesValue";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TreasureLimitDetailStrNode extends ListViewCellBase{
    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView1: CommonCustomListViewEx = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView2: CommonCustomListViewEx = null;

    @property({
        type: cc.Node,
        visible: true
    })    
    _titleNode:cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode:cc.Node = null;

    @property(cc.Prefab)
    commonDesValue:cc.Prefab = null;
    
    _treasureUnitData: any;

    ctor(treasureUnitData) {
        this._treasureUnitData = treasureUnitData;
    }
    onCreate() {
        for (var i = 1; i<=2; i++) {
            this._updateSubView(i);
        }

        var height1 = this._listView1.node.getContentSize().height;
        var height2 = this._listView2.node.getContentSize().height;
        var height = Math.max(height1, height2);
        this.node.setContentSize(940, height+10);

        this.scheduleOnce(function () {
            this._listView1.enabled = false;
            this._listView2.enabled = false;
        }.bind(this), 0.05);

    }
    _updateSubView(index) {
        var title = this._createTitle(index);
        this['_listView' + index].pushBackCustomItem(title);
        var configInfo = this._treasureUnitData.getConfig();
        var level = this._treasureUnitData.getLevel();
        if (index == 2) {
            var limitUpId = this._treasureUnitData.getConfig().limit_up_id;
            if (limitUpId == 0) {
                limitUpId = this._treasureUnitData.getBase_id();
            }
            configInfo = TreasureDataHelper.getTreasureConfig(limitUpId);
        }
        var attrInfo = TreasureDataHelper.getTreasureStrAttrWithConfigAndLevel(configInfo, level);
        for (let type in attrInfo) {
            var value = attrInfo[type];
            var des = this._createAttrDes(type, value);
            this['_listView' + index].pushBackCustomItem(des);
        }
        var des2 = this._createAddLevel(index);
        if (des2) {
            this['_listView' + index].pushBackCustomItem(des2);
        }
        this['_listView' + index].doLayout();
        var contentSize = this['_listView' + index].getInnerContainerSize();
        contentSize.width = 402;
        contentSize.height = contentSize.height + 10;
        this['_listView' + index].node.setContentSize(contentSize);
    }
    _createTitle(index) {
        var item = cc.instantiate(this._titleNode);
        var title = item.getChildByName("title").getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('treasure_limit_detail_str_title'));
        item.addComponent(ListViewCellBase);
        return item;
    }
    _createAttrDes(type, value) {
        var widget = new cc.Node();
        var [name, value] = TextHelper.getAttrBasicText(type, value);
        name = TextHelper.expandTextByLen(name, 4);
        var node = cc.instantiate(this.commonDesValue).getComponent(CommonDesValue);
        node.setFontSize(20);
        node.updateUI(name + '\uFF1A', value);
        node.node.setPosition(24, 20);
        widget.addChild(node.node);
        widget.setAnchorPoint(0,0);
        widget.setContentSize(cc.size(402, 30));
        return widget;
    }
    _createAddLevel(index) {
        if (index == 1 && this._treasureUnitData.getLimit_cost() != TreasureConst.TREASURE_LIMIT_RED_LEVEL) {
            return null;
        }
        var widget = new cc.Node();
        var node = cc.instantiate(this.commonDesValue).getComponent(CommonDesValue);
        node.setFontSize(20);
        node.updateUI(Lang.get('treasure_limit_str_level_max_add'), '+' + TreasureConst.getAddStrLevelByLimit());
        node.node.setPosition(24, 20);
        widget.addChild(node.node);
        widget.setAnchorPoint(0,0);
        widget.setContentSize(cc.size(402, 30));
        return widget;
    }
}
