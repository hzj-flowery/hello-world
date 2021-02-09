import PopupBase from "../../../ui/PopupBase";
import { G_EffectGfxMgr, G_SignalManager, G_UserData, G_ServerTime, Colors } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { GuildCrossWarHelper } from "./GuildCrossWarHelper";
import { GuildCrossWarConst } from "../../../const/GuildCrossWarConst";
import GuildCrossWarAttackCell from "./GuildCrossWarAttackCell";
import { Util } from "../../../utils/Util";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import GuildCrossStrongHold from "./GuildCrossStrongHold";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupGuildCrossWarSmallMap extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBk: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMapBG: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlaceAttackName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;


    _autoMovingNode: any;
    _listView: any;
    _btnAttackList: any;
    _strongHoldMap: any[];
    _signalUpdatePoint: any;
    _listCellMap: any[];

    initData() {
        this._autoMovingNode = null;
        this._listView = null;
        this._btnAttackList = null;
        this._strongHoldMap = [];
    }
    onCreate() {
        this.initData();
        this._initPointName();
        this._initStrongHold();
        this._initListView();
        G_EffectGfxMgr.createPlayGfx(this._autoMovingNode, 'effect_xianqinhuangling_zidongxunluzhong', null, true);
        this._autoMovingNode.setVisible(false);
    }
    _onClickButton(sender) {
        this.close();
    }
    onEnter() {
        this._signalUpdatePoint = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPOINT, handler(this, this._onEventUpdatePoint));
        this._initAttackView();
        this._initAttackEnable();
        this._updateStrongHold();
    }
    onExit() {
        this._signalUpdatePoint.remove();
        this._signalUpdatePoint = null;
    }
    _initAttackEnable() {
        if (G_UserData.getGuildCrossWar().getSelfUnit()) {
            this._btnAttackList.setEnabled(G_UserData.getGuildCrossWar().getSelfUnit().isGuildLeader());
        }
    }
    _initPointName() {
        for (var index = 17; index <= 25; index++) {
            var itemData = GuildCrossWarHelper.getWarCfg(index);
            this['_fileNode' + index].updateUI(GuildCrossWarHelper.replaceStr(itemData.point_name));
        }
    }
    _initStrongHold() {
        for (var point = 1; point <= GuildCrossWarHelper.getPointCount(); point++) {
            let strongHold = Util.getNode("prefab/guildCrossWar/GuildCrossStrongHold", GuildCrossStrongHold) as GuildCrossStrongHold;
            strongHold.initData(point);
            this._strongHoldMap[point] = strongHold;
            this._imageMapBG.node.addChild(strongHold.node, 5000);
            strongHold.updateHold(false);
            strongHold.updateAttack(false, null);
        }
    }
    _initState() {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null || selfUnit.isReachEdge() != true) {
            selfUnit.setReachEdge(true);
        }
    }
    _initAttackView() {
        for (var point = 1; point <= GuildCrossWarHelper.getPointCount(); point++) {
            this._strongHoldMap[point].updateAttack(true);
        }
    }
    _initListView() {
        var updateAtcTarget = function (attackId) {
            this._fadeListView();
            if (typeof (attackId) != 'number') {
                return;
            }
            for (var index = 17; index <= 25; index++) {
                this._listCellMap[index].updateNameColor(index == attackId);
            }
            if (G_UserData.getGuildCrossWar().getSelfGuildTarget() != attackId) {
                G_UserData.getGuildCrossWar().c2sBrawlGuildsFollowMe(attackId);
            }
        }.bind(this);
        this._listCellMap = [];
        this._listView.removeAllChildren();
        this._listView.setVisible(false);
        for (var index = 17; index <= 25; index++) {
            var warCfg = GuildCrossWarHelper.getWarCfg(index);
            warCfg.backIndex = index % 2 + 1;
            let cell = Util.getNode("prefab/guildCrossWar/GuildCrossWarAttackCell", GuildCrossWarAttackCell) as GuildCrossWarAttackCell;
            cell.initData(updateAtcTarget);
            cell.updateUI(warCfg);
            this._listCellMap[index] = cell;
            this._listView.pushBackCustomItem(cell);
        }
        this._listView.adaptWithContainerSize();
        var contentsize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentsize);
        this._btnAttackList.addClickEventListenerEx(handler(this, this._fadeListView));
    }
    _updateAtcTargetName(pointId) {
        if (pointId == 0) {
            this._textPlaceAttackName.string = (Lang.get('guild_cross_war_noguild'));
        } else {
            var warCfg = GuildCrossWarHelper.getWarCfg(pointId);
            this._textPlaceAttackName.string = (warCfg.point_name);
            this._textPlaceAttackName.node.color = (Colors.GUILDCROSSWAR_ATCCOLOR);
            UIHelper.enableOutline(this._textPlaceAttackName, Colors.GUILDCROSSWAR_ATCCOLOR_OUT);
        }
    }
    _fadeListView() {
        var bVisible = !this._listView.isVisible();
        this._btnAttackList.setFlippedY(bVisible);
        if (bVisible) {
            this._listView.setVisible(true);
            this._listView.runAction(cc.sequence(cc.scaleTo(0.2, 1, 1), cc.fadeIn(0.2)));
        } else {
            this._listView.runAction(cc.sequence(cc.scaleTo(0.2, 1, 0.1), cc.fadeOut(0.2), cc.callFunc(function () {
                this._listView.setVisible(false);
            })));
        }
    }
    _onEventUpdatePoint() {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null || selfUnit.isMoving()) {
            return;
        }
        this._updateHoldView();
    }
    _updateHoldView() {
        var pointMap = G_UserData.getGuildCrossWar().getPointMap() || [];
        for (var k in pointMap) {
            var unit = pointMap[k];
            if (!GuildCrossWarHelper.isOriPoint(unit.getKey_point_id())) {
                this._strongHoldMap[unit.getKey_point_id()].updateHold(unit.isSelfGuild());
            }
        }
    }
    _updateStrongHold(dt?) {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null) {
            return;
        }
        function updateAttackAndHoldView(unit) {
            this._updateHoldView();
        }
        if (dt) {
            if (G_ServerTime.getLeftSeconds(selfUnit.getMove_cd()) >= 0 && !selfUnit.isMoving()) {
                updateAttackAndHoldView(selfUnit);
            } else if (selfUnit.isMoving()) {
                this._updateHoldView();
            }
        } else {
            updateAttackAndHoldView(selfUnit);
        }
    }
    convertToBigMapPos(pos) {
        pos.x = pos.x * GuildCrossWarConst.CAMERA_SCALE_MAX;
        pos.y = pos.y * GuildCrossWarConst.CAMERA_SCALE_MAX;
        return pos;
    }
    updateSelf(selfPosX, selfPosY) {
        GuildCrossWarHelper.updateSelfNode(this._imageMapBG, selfPosX, selfPosY);
    }
    updateSelfGuildNumber(userList) {
        GuildCrossWarHelper.updateSelfGuildMemeber(this._imageMapBG, userList);
    }
    _onPanelClick(sender, state) {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null) {
            return;
        }
        var endPos = this._panelTouch.convertToNodeSpace(sender.getTouchEndPosition());
        var convertPos = this.convertToBigMapPos(endPos);
        var clickPoint = G_UserData.getGuildCrossWar().findPointHoleKey(convertPos);
    }
    _updateAuotMovingEffect() {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null) {
            return;
        }
        if (this._autoMovingNode.isVisible() != selfUnit.isMoving()) {
            this._autoMovingNode.setVisible(selfUnit.isMoving());
        }
    }
    update(dt) {
        this._updateStrongHold(dt);
        this._updateAuotMovingEffect();
        this._updateAtcTargetName(G_UserData.getGuildCrossWar().getSelfGuildTarget());
    }

}