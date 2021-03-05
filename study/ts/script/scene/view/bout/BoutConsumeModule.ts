import { BoutConst } from "../../../const/BoutConst";
import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLargeHighlight from "../../../ui/component/CommonButtonLargeHighlight";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { Color } from "../../../utils/Color";
import { AttrDataHelper } from "../../../utils/data/AttrDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { rawequal } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import { BoutHelper } from "./BoutHelper";


const {ccclass, property} = cc._decorator;
@ccclass
export default class  BoutConsumeModule extends ViewBase {
    name: 'BoutConsumeModule'

    @property({
        type: cc.Node,
        visible: true
    })
    _content: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelOffcial: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _needOfficial2: cc.Node = null;
    
    @property({
        type: cc.Sprite,
        visible: true
    })
    _officialImg: cc.Sprite = null;
    
    @property({
        type: CommonButtonLargeHighlight,
        visible: true
    })
    _commonBtn: CommonButtonLargeHighlight = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _CommonHeroIcon: cc.Prefab = null;

    
    private _curBoutPoint:any;
    onCreate() {
        this._curBoutPoint = {};
        this._commonBtn.setString(Lang.get('bout_consumehero_active'));
        this._commonBtn.addClickEventListenerEx(handler(this, this._unLockBoutPoint));
    }
    onEnter() {
    }
    onExit() {
    }
    _unLockBoutPoint() {
        var data = G_UserData.getBout().getBoutInfo()[this._curBoutPoint.id][this._curBoutPoint.pos];
        if (!BoutHelper.isEnoughJade2(data.cost_yubi)) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2);
            return;
        }
        if (BoutHelper.isSpecialBoutPoint(this._curBoutPoint.id, this._curBoutPoint.pos)) {
            if (!BoutHelper.isCanUnlockSBoutPoint(this._curBoutPoint.pos)) {
                return;
            }
        }
        var [canUnlock, materialsIds] = BoutHelper.isEnoughConsume(this._curBoutPoint);
        if (!canUnlock) {
            return;
        }
        G_UserData.getBout().c2sUnlockBout(this._curBoutPoint.id, this._curBoutPoint.pos, materialsIds);
    }
    _updateAttrAdded(id, pos, isChangePos?, offsetY?) {
        offsetY = offsetY || 0;
        var countIndx = 0;
        var topPosY = isChangePos && 60 || 165;
        var size = this._content.getContentSize();
        var attrs = BoutHelper.getAttrbute(id, pos);
        for (let k in attrs) {
            var v = attrs[k];
            var widget = RichTextExtend.createWithContent(AttrDataHelper.getBoutContentActive(k, v));
            widget.node.setAnchorPoint(cc.v2(0.5, 0.5));
            widget.node.setPosition(cc.v2(0, topPosY + offsetY + countIndx * 25));
            this._content.addChild(widget.node);
        }
    }
    _createConsumeJade(jade2Num) {
        var yubiTypeRes = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2, 1);
        if (yubiTypeRes.res_mini) {
            var size = this._content.getContentSize();
            var panel = new cc.Node();
            panel.setContentSize(size.width, 60);
            var jadeImg = UIHelper.createImage({ texture: yubiTypeRes.res_mini });
            jadeImg.setAnchorPoint(cc.v2(0, 0.5));
            var color = BoutHelper.isEnoughJade2(jade2Num) && Colors.SYSTEM_TARGET || Colors.RED;
            var labelName = new cc.Node().addComponent(cc.Label);
            labelName.fontSize = 20;
            labelName.string = (Lang.get('bout_consumejade2_actived', { value: jade2Num }));
            labelName.node.color = (color);
            labelName.node.setAnchorPoint(cc.v2(0, 0.5));
            UIHelper.updateLabelSize(labelName);
            labelName.node.x = -(labelName.node.getContentSize().width/2+20);
            var posX = labelName.node.x + labelName.node.getContentSize().width;
            jadeImg.x = (posX);
            jadeImg.y = 16;
            panel.setAnchorPoint(cc.v2(0.5, 0.5));
            panel.setPosition(cc.v2(0,65));
            panel.addChild(jadeImg);
            panel.addChild(labelName.node);
            this._content.addChild(panel);
        }
    }
    _updateJade2Show(jade2Num, id, pos) {
        if (jade2Num <= 0) {
            return true;
        }
        if (BoutHelper.isSpecialBoutPoint(id, pos)) {
            if (this._isUnlocked(id, pos)) {
                return true;
            } else {
                var curList = G_UserData.getBout().getBoutList()[id] || {};
                var infoList = G_UserData.getBout().getBoutInfo()[id];
                if (rawequal(table.nums(infoList) - 1, table.nums(curList))) {
                    this._updateAttrAdded(id, pos, true, 55);
                    this._createConsumeJade(jade2Num);
                    this._commonBtn.setVisible(true);
                    return false;
                } else {
                    this._updateAttrAdded(id, pos, true);
                    var labelName = new cc.Node().addComponent(cc.Label);
                    labelName.string = (Lang.get('bout_unlock_normalfirst2'));
                    labelName.node.color = (Colors.RED);
                    labelName.fontSize = 20;
                    labelName.node.setAnchorPoint(cc.v2(0.5, 0.5));
                    labelName.node.setPosition(cc.v2(20, 20));
                    this._content.addChild(labelName.node);
                    this._commonBtn.setVisible(false);
                    return false;
                }
            }
        }
    }
    _isUnlocked(id, pos) {
        var isLock = G_UserData.getBout().checkUnlocked(id, pos);
        if (!isLock) {
            this._commonBtn.setString(Lang.get('bout_consumehero_actived'));
            this._commonBtn.setVisible(false);
            return true;
        } else {
            this._commonBtn.setString(Lang.get('bout_consumehero_active'));
            this._commonBtn.setEnabled(true);
        }
        return false;
    }
    _isOfficialEnough(id, pos) {
        var [isEnoughOff, needLevel] = BoutHelper.checkOfficerLevel({
                id: id,
                pos: pos
            });
        this._commonBtn.setVisible(isEnoughOff);
        this._panelOffcial.active = (!isEnoughOff);
        if (!isEnoughOff) {
            var [info] = G_UserData.getBase().getOfficialInfo(needLevel);
            UIHelper.loadTexture(this._officialImg,Path.getTextHero(info.picture))
            // this._officialImg.ignoreContentAdaptWithSize(true);
            this._officialImg.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            var targetPosX = this._officialImg.node.x + this._officialImg.node.getContentSize().width/2;
            this._needOfficial2.x = (targetPosX);
            return false;
        }
        return true;
    }
    updateUI(id, pos) {
        this._content.removeAllChildren();
        this._curBoutPoint.id = id;
        this._curBoutPoint.pos = pos;
        if (!this._isOfficialEnough(id, pos)) {
            this._content.getComponent(cc.BlockInputEvents).enabled = (false);
            this._updateAttrAdded(id, pos, true);
            return;
        }
        var [consumeItems, jade2Num] = BoutHelper.getConsumeItems(id, pos);
        var max = consumeItems.length;
        if (rawequal(max, 0)) {
            this._content.getComponent(cc.BlockInputEvents).enabled = (false);
            this._commonBtn.setEnabled(true);
        }
        if (!this._updateJade2Show(jade2Num, id, pos)) {
            this._content.getComponent(cc.BlockInputEvents).enabled = (false);
            return;
        }
        if (this._isUnlocked(id, pos)) {
            this._content.getComponent(cc.BlockInputEvents).enabled = (false);
            this._commonBtn.setString(Lang.get('bout_consumehero_actived'));
            this._commonBtn.setVisible(true);
            this._commonBtn.setEnabled(false);
            this._updateAttrAdded(id, pos, true, 20);
            return;
        }
        var canEnable = true;
        for (var index = 1; index <= max; index++) {
            var uiNode = cc.instantiate(this._CommonHeroIcon).getComponent(CommonHeroIcon);
            this._content.addChild(uiNode.node);
            uiNode.updateHeroIcon(consumeItems[index-1].value);
            uiNode.setTouchEnabled(true);
            uiNode.node.setScale(0.8);
            let pos = BoutConst.CONSUME_HERO_POS[max-1][index-1];
            let width:number = this._content.width;
            let height:number = this._content.height;
            uiNode.node.setPosition(pos.x - (width)/2,pos.y);
            var labelName = new cc.Node().addComponent(cc.Label);
            labelName.fontSize = 20;
            var count = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, consumeItems[index-1].value);
            var bEnough = count >= consumeItems[index-1].size;
            var color = bEnough && Colors.TacticsActiveColor || Colors.RED;
            labelName.string = (Lang.get('common_list_count', {
                count1: count,
                count2: consumeItems[index-1].size
            }));
            labelName.node.color = (color);
            UIHelper.enableOutline(labelName,Color.NUMBER_WHITE_OUTLINE, 2);
            labelName.node.setPosition(cc.v2(0, -47));
            uiNode.node.addChild(labelName.node);
            uiNode.setHeroIconMask(!bEnough);
            
            if (canEnable && !bEnough) {
                canEnable = false;
            }
        }
        if (max > 0) {
            this._commonBtn.setEnabled(canEnable);
        }
        this._content.getComponent(cc.BlockInputEvents).enabled = (true);
        this._updateAttrAdded(id, pos);
    }
};