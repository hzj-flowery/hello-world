import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { FunctionConst } from "../../../const/FunctionConst";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { Colors, G_SceneManager } from "../../../init";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { handler } from "../../../utils/handler";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import { TreasureTrainHelper } from "../treasureTrain/TreasureTrainHelper";
import TreasureConst from "../../../const/TreasureConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import CommonMasterInfoNode from "../../../ui/component/CommonMasterInfoNode";
import { TextHelper } from "../../../utils/TextHelper";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";

const { ccclass, property } = cc._decorator;


@ccclass
export default class TreasureDetailRefineNode extends ListViewCellBase{

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property(cc.Prefab)    
    CommonDetailTitleWithBg:cc.Prefab = null;

    @property(cc.Prefab)
    CommonDesValue:cc.Prefab = null;

    @property(cc.Prefab)
    CommonButtonLevel2Highlight:cc.Prefab = null;

    @property(cc.Prefab)
    CommonMasterInfoNode:cc.Prefab = null;

    _treasureData: any;
    _rangeType: any;

    ctor(treasureData, rangeType) {
        this._treasureData = treasureData;
        this._rangeType = rangeType;
    }

    onCreate() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var heightOfBtn = title.getContentSize().height;
        var offset = 0;
        if (this._treasureData.isUserTreasure()) {
            var [btnWidget1, height1] = this._createButton1();
            this._listView.pushBackCustomItem((btnWidget1 as cc.Node));
            heightOfBtn = heightOfBtn + (height1 as number);
            if (this._treasureData.isCanLimitBreak() && FunctionCheck.funcIsShow(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4)) {
                var [btnWidget2, height2] = this._createButton2();
                this._listView.pushBackCustomItem((btnWidget2 as cc.Node));
                heightOfBtn = heightOfBtn + (height2 as number);
            }
        } else {
            offset = 10;
        }
        var level = this._createLevelDes();
        this._listView.pushBackCustomItem(level);
        this._addAttrDes();
        var [master, line] = this._createMasterInfo();
        if (master) {
            this._listView.pushBackCustomItem((master as cc.Node));
        }
        var contentSize = this._listView.getInnerContainerSize();
        var height = Math.max(contentSize.height + offset, heightOfBtn);
        contentSize.height = height;
        this._listView.setInnerContainerSize(contentSize);
        this.node.setContentSize(contentSize);
        this._listView.doLayout();
    }
    onEnter(){
        this._listView.setTouchEnabled(false);
    }
    _createTitle() {
        var title = cc.instantiate(this.CommonDetailTitleWithBg).getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('treasure_detail_title_refine'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 50);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, 30);
        widget.addComponent(ListViewCellBase);
        widget.addChild(title.node);
        return widget;
    }
    _createLevelDes() {
        var widget = new cc.Node();
        var node = cc.instantiate(this.CommonDesValue).getComponent(CommonDesValue);
        var des = Lang.get('treasure_detail_refine_level');
        var value = this._treasureData.getRefine_level();
        var max = this._treasureData.getMaxRefineLevel();
        var color = value < max && Colors.BRIGHT_BG_ONE || Colors.BRIGHT_BG_GREEN;
        node.setFontSize(20);
        node.updateUI(des, value, max);
        node.setValueColor(color);
        node.setMaxColor(color);
        node.node.setPosition(24, 20);
        widget.addChild(node.node);
        widget.addComponent(ListViewCellBase);
        widget.setContentSize(cc.size(402, 30));
        return widget;
    }
    _addAttrDes() {
        var attrInfo = UserDataHelper.getTreasureRefineAttr(this._treasureData);
        for (var k in attrInfo) {
            var value = attrInfo[k];
            var widget = new cc.Node();
            var [name, value] = TextHelper.getAttrBasicText(k, value);
            name = TextHelper.expandTextByLen(name, 4);
            var node = cc.instantiate(this.CommonDesValue).getComponent(CommonDesValue);
            node.setFontSize(20);
            node.updateUI(name + '\uFF1A', value);
            node.node.setPosition(24, 20);
            widget.addChild(node.node);
            widget.setContentSize(cc.size(402, 30));
            this._listView.pushBackCustomItem(widget);
        }
    }
    _createMasterInfo() {
        var pos = this._treasureData.getPos();
        var info = UserDataHelper.getMasterTreasureRefineInfo(pos);
        var level = info.curMasterLevel;
        if (level <= 0) {
            return [null];
        }
        var widget = new cc.Node();
        var master = cc.instantiate(this.CommonMasterInfoNode).getComponent(CommonMasterInfoNode);
        var title = Lang.get('treasure_datail_refine_master', { level: level });
        var attrInfo = info.curAttr;
        var line = master.updateUI(title, attrInfo);
        widget.addChild(master.node);
        var size = master.getContentSize();
        widget.setContentSize(size);
        widget.addComponent(ListViewCellBase);
        return [
            widget,
            line
        ];
    }
    _createButton1() {
        var widget = new cc.Node();
        var btn = cc.instantiate(this.CommonButtonLevel2Highlight).getComponent(CommonButtonLevel2Highlight);
        btn.setString(Lang.get('treasure_detail_btn_refine'));
        btn.addClickEventListenerEx(handler(this, this._onButtonRefineClicked));
        widget.addChild(btn.node);
        var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, 'slotRP', this._treasureData);
        btn.showRedPoint(reach);
        btn.node.setPosition(324, -27);
        widget.setContentSize(cc.size(402, 1));
        widget.addComponent(ListViewCellBase);
        return [
            widget,
            75
        ];
    }
    _createButton2() {
        var widget = new cc.Node();
        var btn = cc.instantiate(this.CommonButtonLevel2Highlight).getComponent(CommonButtonLevel2Highlight);
        btn.setString(Lang.get('treasure_detail_btn_limit'));
        btn.addClickEventListenerEx(handler(this, this._onButtonLimitClicked));
        widget.addChild(btn.node);
        btn.setEnabled(FunctionCheck.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4)[0]);
        var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, 'slotRP', this._treasureData);
        btn.showRedPoint(reach);
        btn.node.setPosition(324, -95);
        widget.setContentSize(cc.size(402, 1));
        widget.addComponent(ListViewCellBase);
        return [
            widget,
            75
        ];
    }
    _onButtonRefineClicked() {
        if (TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2) == false) {
            return;
        }
        var treasureId = this._treasureData.getId();
        G_SceneManager.showScene('treasureTrain', treasureId, TreasureConst.TREASURE_TRAIN_REFINE, this._rangeType, true);
    }
    _onButtonLimitClicked() {
        var treasureId = this._treasureData.getId();
        G_SceneManager.showScene('treasureTrain', treasureId, TreasureConst.TREASURE_TRAIN_LIMIT, this._rangeType, true);
    }

}
