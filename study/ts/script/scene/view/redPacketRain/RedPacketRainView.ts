import { AudioConst } from "../../../const/AudioConst";
import { RedPacketRainConst } from "../../../const/RedPacketRainConst";
import { SignalConst } from "../../../const/SignalConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import PopupRedPacketRainStart from "./PopupRedPacketRainStart";
import PopupRedRainSettlement from "./PopupRedRainSettlement";
import RedPacketNode from "./RedPacketNode";
import RedPacketRainRankNode from "./RedPacketRainRankNode";


const { ccclass, property } = cc._decorator;

var RECORD_MAX = 4;
var MOVE_TIME = 0.5;
var DROPTIME = {
    [RedPacketRainConst.TYPE_BIG]: 0.8,
    [RedPacketRainConst.TYPE_SMALL]: 1.5
};
var POS_INTERVAL = 100;
@ccclass
export default class RedPacketRainView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRecord: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMoney: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCount: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRank: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    redPacketNode: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    redPacketRainRankNode: cc.Prefab = null;

    _schedulePlay: any;
    _scheduleCountDown: any;
    _schedulePreCountDown: any;
    _finishPreTime: number;
    _finishTime: number;
    _minPosX: any;
    _maxPosX: number;
    _minPosY: number;
    _maxPosY: number;
    _packetList: any[];
    _recordDataList: any[];
    _recordNodeList: any[];
    _rainInterval: number;
    _isRecordMoving: boolean;
    _signalEnterSuccess: any;
    _signalGetResult: any;
    _signalGetNotify: any;
    _packetIndex: number;
    _schedulerRequestRank: any;
    _rankNode: cc.Node;
    _randomIndex: any[];
    _randomPosX: any[];
    _signalGetResultTimeout: any;
    _signalGetRank: any;


    onCreate() {
        this.setSceneSize();
        this.node.setAnchorPoint(0, 0);
        this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        this._initData();
        this._initView();
    }
    _initData() {
        this._schedulePlay = null;
        this._scheduleCountDown = null;
        this._schedulePreCountDown = null;
        this._schedulerRequestRank = null;
        this._finishPreTime = 0;
        this._finishTime = 0;
        this._minPosX = G_ResolutionManager.getBangOffset() + POS_INTERVAL;
        this._maxPosX = G_ResolutionManager.getBangDesignWidth() - POS_INTERVAL;
        this._minPosY = G_ResolutionManager.getDesignHeight() - 200;
        this._maxPosY = G_ResolutionManager.getDesignHeight() - 50;
        this._packetList = [];
        this._recordDataList = [];
        this._recordNodeList = [];
        this._rainInterval = 0;
        this._isRecordMoving = false;
        this._initRandomPosX();
        this._rankNode = null;
    }
    _initRandomPosX() {
        this._randomPosX = [];
        this._randomIndex = [];
        var index = 1;
        var posX = this._minPosX;
        while (posX <= this._maxPosX) {
            this._randomPosX[index] = posX;
            this._randomIndex[index] = false;
            posX = posX + POS_INTERVAL;
            index = index + 1;
        }
    }
    _initView() {
        for (var i = 1; i <= RECORD_MAX; i++) {
            var node = new cc.Node();
            //node.setCascadeOpacityEnabled(true);
            var posY = 35 * (RECORD_MAX - i);
            node.setPosition(cc.v2(0, posY));
            this._nodeRecord.addChild(node);
            this._recordNodeList.push(node);
        }
        this._rankNode = cc.instantiate(this.redPacketRainRankNode);
        this._rankNode.getComponent(RedPacketRainRankNode).ctor(handler(this, this._onClickQuit));
        this._nodeRank.addChild(this._rankNode);
        this._rankNode.active = false;
    }
    onEnter() {
        this._signalEnterSuccess = G_SignalManager.add(SignalConst.EVENT_RED_PACKET_RAIN_ENTER_SUCCESS, handler(this, this._onEventEnterSuccess));
        this._signalGetResult = G_SignalManager.add(SignalConst.EVENT_RED_PACKET_RAIN_GET_SUCCESS, handler(this, this._onEventGetResult));
        this._signalGetNotify = G_SignalManager.add(SignalConst.EVENT_RED_PACKET_RAIN_GET_NOTIFY, handler(this, this._onEventGetNotify));
        this._signalGetResultTimeout = G_SignalManager.add(SignalConst.EVENT_RED_PACKET_RAIN_GET_TIMEOUT, handler(this, this._onEventGetResultTimeout))
        this._signalGetRank = G_SignalManager.add(SignalConst.EVENT_RED_PACKET_RAIN_GET_RANK, handler(this, this._onEventGetRank))
        this._updateMoney();
        if (G_UserData.getRedPacketRain().isPlayed()) {
            this._textCountDown.string = "0";
            this._requestRankInfo();
        }
        this._popupStartView();
    }
    onExit() {
        this._stopRain();
        this._stopPreCountDown();
        this._stopCountDown();
        this._stopRequestRankCountDown();
        this._signalEnterSuccess.remove();
        this._signalEnterSuccess = null;
        this._signalGetResult.remove();
        this._signalGetResult = null;
        this._signalGetNotify.remove();
        this._signalGetNotify = null;
        this._signalGetResultTimeout.remove();
        this._signalGetResultTimeout = null;
        this._signalGetRank.remove();
        this._signalGetRank = null;
    }
    _popupStartView() {
        PopupRedPacketRainStart.getIns(PopupRedPacketRainStart, (pop) => {
            pop.ctor(handler(this, this._onClickStart), handler(this, this._onClickQuit));
            pop.open();
        })
    }
    _onClickStart() {
        this._finishPreTime = G_ServerTime.getTime() + RedPacketRainConst.TIME_PRE_START;
        if (this._finishPreTime >= G_UserData.getRedPacketRain().getActEndTime()) {
            G_Prompt.showTip(Lang.get('red_pacekt_rain_finish_tip'));
            return false;
        }
        this._nodeCount.active = (true);
        this._startPreCountDown();
        return true;
    }
    _onClickQuit() {
        G_SceneManager.popScene();
    }
    _startPreCountDown() {
        this._stopPreCountDown();
        this._schedulePreCountDown = handler(this, this._updatePreCountDown);
        this.schedule(this._schedulePreCountDown, 1);
        this._updatePreCountDown();
    }
    _stopPreCountDown() {
        if (this._schedulePreCountDown != null) {
            this.unschedule(this._schedulePreCountDown);
            this._schedulePreCountDown = null;
        }
    }
    _updatePreCountDown() {
        var nowTime = G_ServerTime.getTime();
        var countDownTime = this._finishPreTime - nowTime;
        if (countDownTime > 0) {
            if (countDownTime >= 0 && countDownTime <= 3) {
                G_EffectGfxMgr.createPlayGfx(this._nodeCount, 'effect_jingjijishi_' + countDownTime, null, true);
            }
        } else {
            this._stopPreCountDown();
            this._nodeCount.active = (false);
            G_UserData.getRedPacketRain().c2sEnterNewRedPacket();
        }
    }
    _startRain() {
        this._packetIndex = 1;
        this._stopRain();
        this._schedulePlay = handler(this, this._updateRain);
        this.schedule(this._schedulePlay, this._rainInterval);
        this._updateRain();
    }
    _stopRain() {
        if (this._schedulePlay != null) {
            this.unschedule(this._schedulePlay);
            this._schedulePlay = null;
        }
    }
    _updateRain() {
        if (this._packetIndex > this._packetList.length) {
            this._stopRain();
            return;
        }
        var index = this._getRandomIndex();
        var posX = Math.randInt(this._minPosX, this._maxPosX);

        var startPos = cc.v2(posX, 590);
        var unitData = this._packetList[this._packetIndex - 1];

        var comp = cc.instantiate(this.redPacketNode).getComponent(RedPacketNode);
        comp.ctor(unitData, index, (index) => {
            this._randomPosX[index] = false;
        });


        if (comp) {
            comp.node.setPosition(startPos);
            this.node.addChild(comp.node);
            var dropTime = DROPTIME[unitData.getRedpacket_type()] || 2;
            var moveBy = cc.moveBy(dropTime, cc.v2(0, -540));
            var EaseSineIn = moveBy.easing(cc.easeSineIn());
            var fadeOut = cc.fadeOut(RedPacketRainConst.TIME_DISAPPEAR);
            var seq = cc.sequence(EaseSineIn, fadeOut, cc.destroySelf());
            comp.node.runAction(seq);
            this._packetIndex = this._packetIndex + 1;
        }
    }

    _getRandomIndex() {
        var indexs = [];
        for (var k in this._randomIndex) {
            var state = this._randomIndex[k];
            if (state == false) {
                indexs.push(k);
            }
        }
        if (indexs.length == 0) {
            return 1;
        }
        var random = (Math.random() + 1) * indexs.length;
        var index = indexs[random];
        this._randomIndex[index] = true;
        return index;
    }

    _startCountDown() {
        this._stopCountDown();
        this._scheduleCountDown = handler(this, this._updateCountDown);
        this.schedule(this._scheduleCountDown, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        if (this._scheduleCountDown != null) {
            this.unschedule(this._scheduleCountDown);
            this._scheduleCountDown = null;
        }
    }
    _updateCountDown() {
        var nowTime = G_ServerTime.getTime();
        var countDownTime = this._finishTime - nowTime;
        if (countDownTime > 0) {
            this._textCountDown.string = (countDownTime.toString());
        } else {
            this._textCountDown.string = ('0');
            this._stopCountDown();
            this._popupSettlement();
        }
    }
    _onFinish() {
        this._textCountDown.string = ('0');
        this._stopCountDown();
        this._popupSettlement();
    }
    _popupSettlement() {
        var data = G_UserData.getRedPacketRain().getReceivedPacketData();
        PopupRedRainSettlement.getIns(PopupRedRainSettlement, (p) => {
            p.ctor(data, handler(this, this._requestRankInfo));
            p.openWithAction();
        });
        G_AudioManager.playSoundWithId(AudioConst.SOUND_NEW_FUNC_OPEN);
    }
    _onEventEnterSuccess() {
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_HORSE_RACE);
        this._packetList = G_UserData.getRedPacketRain().getPacketList();
        this._finishTime = G_ServerTime.getTime() + RedPacketRainConst.TIME_PLAY;
        var count = this._packetList.length;
        var sec = RedPacketRainConst.TIME_PLAY - RedPacketRainConst.TIME_PRE_FINISH;
        this._rainInterval = sec / count;
        this._startRain();
        this._startCountDown();
    }
    _onEventGetResult(eventName, packetId) {
        var text = null;
        var unitData = G_UserData.getRedPacketRain().getUnitDataWithId(packetId);
        var isReal = unitData.isReal();
        if (isReal) {
            var type = unitData.getRedpacket_type();
            if (type == RedPacketRainConst.TYPE_BIG) {
                text = RichTextExtend.createRichTextByFormatString(Lang.get('red_packet_rain_result_big', { num: unitData.getMoney() }), { defaultSize: 20 });
            } else {
                text = RichTextExtend.createRichTextByFormatString(Lang.get('red_packet_rain_result_small', { num: unitData.getMoney() }), { defaultSize: 20 });
            }
        } else {
            var user = this._getRandomGrabUser();
            if (unitData.isRob() && user) {
                var params = {
                    other: [
                        {},
                        { color: Colors.getOfficialColor(user.getOfficer_level()) }]
                }
                text = RichTextExtend.createRichTextByFormatString(Lang.get('red_packet_rain_result_grab', { name: user.getName() }), params);
            } else {
                text = RichTextExtend.createRichTextByFormatString(Lang.get('red_packet_rain_result_empty'));
            }
        }
        this._updateMoney();
    }
    _getRandomGrabUser() {
        var index = Math.randInt(1, this._recordDataList.length);
        if (this._recordDataList[index - 1]) {
            return this._recordDataList[index - 1].user;
        } else {
            return null;
        }
    }
    _playPrompt(text) {
        var sp = UIHelper.newSprite(Path.getRedBagImg('img_huodedi'));
        var nodeSize = sp.node.getContentSize();
        text.setPosition(cc.v2(nodeSize.width / 2, nodeSize.height / 2));
        sp.node.addChild(text);
        this.node.addChild(sp.node);
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        sp.node.setPosition(cc.v2(width / 2, height / 2));
        var moveBy = cc.moveBy(2, cc.v2(0, 100));
        var seq = cc.sequence(moveBy, cc.destroySelf());
        sp.node.runAction(seq);
    }
    _onEventGetNotify(eventName, records) {
        for (var i in records) {
            var record = records[i];
            this._recordDataList.push(record);
        }
        if (records.length > 0 && this._isRecordMoving == false) {
            this._pushRecordNode();
        }
    }
    _onEventGetResultTimeout(eventName) {
        this._stopRain();
        this._onFinish();
    }
    _onEventGetRank(eventName, listInfo, myInfo) {
        this._updateRankView(listInfo, myInfo);
    }
    _pushRecordNode() {
        var record = this._recordDataList[0];
        if (record) {
            if (record.packet.getRedpacket_type() == RedPacketRainConst.TYPE_BIG) {
                this._playRecordEffect(record);
            }
            this._pushBullet(record);
            var firstNode = this._recordNodeList[0];
            this._isRecordMoving = true;
            this._moveOut(firstNode, function () {
                firstNode.removeAllChildren();
                this._recordNodeList.shift();
                this._recordNodeList.push(firstNode);
                this._recordDataList.shift();
                var recordNode = this._createRecordItem(record);
                firstNode.addChild(recordNode);
                firstNode.setPosition(cc.v2(0, 0));
                this._moveIn(firstNode, function () {
                    if (this._recordDataList[0]) {
                        this._pushRecordNode();
                    } else {
                        this._isRecordMoving = false;
                    }
                }.bind(this));
            }.bind(this));
            for (var i = 2; i <= RECORD_MAX; i++) {
                var node = this._recordNodeList[i - 1];
                this._moveUp(node);
            }
        }
    }
    _createRecordItem(record) {
        var name = record.user.getName();
        var officerLevel = record.user.getOfficer_level();
        var money = record.packet.getMoney();
        var sp = UIHelper.newSprite(Path.getRedBagImg('img_huodedi2'));
        sp.node.setAnchorPoint(cc.v2(1, 0));
        //  sp.node.setCascadeOpacityEnabled(true);
        var formatStr = Lang.get('red_packet_rain_grab_text_1', {
            name: name,
            count: money
        });
        var params = {
            defaultColor: Colors.DARK_BG_ONE,
            defaultSize: 20,
            other: [{ color: Colors.getOfficialColor(officerLevel) }]
        };
        var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
        richText.node.setAnchorPoint(cc.v2(1, 0.5));
        var nodeSize = sp.node.getContentSize();
        richText.node.setPosition(cc.v2(nodeSize.width - 5, nodeSize.height / 2));
        sp.node.addChild(richText.node);
        return sp.node;
    }
    _moveIn(node, callback) {
        node.opacity = (255);
        if (callback) {
            callback();
        }
    }
    _moveOut(node, callback) {
        var fadeOut = cc.fadeOut(MOVE_TIME);
        var seq = cc.sequence(fadeOut, cc.callFunc(function () {
            if (callback) {
                callback();
            }
        }));
        node.runAction(seq);
    }
    _moveUp(node) {
        var moveBy = cc.moveBy(MOVE_TIME, cc.v2(0, 35));
        node.runAction(moveBy);
    }
    _playRecordEffect(record) {
        function eventFunction(event, frameIndex, effectNode) {
            if (event == 'finish') {
                effectNode.node.runAction(cc.destroySelf());
            }
        }
        var name = record.user.getName();
        var officerLevel = record.user.getOfficer_level();
        var money = record.packet.getMoney();
        var formatStr = Lang.get('red_packet_rain_big_get_tip', {
            name: name,
            money: money
        });
        var params = {
            defaultSize: 26,
            other: [{ color: Colors.getOfficialColor(officerLevel) }]
        };
        var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
        this.node.addChild(richText.node);
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        richText.node.setPosition(cc.v2(width / 2, height / 2 + 120));
        G_EffectGfxMgr.applySingleGfx(richText.node, 'smoving_danmu', eventFunction, null, null);
    }
    _updateMoney() {
        var data = G_UserData.getRedPacketRain().getReceivedPacketData();
        this._textMoney.string = ((data.money).toString());
    }
    _pushBullet(record) {
        var type = record.packet.getRedpacket_type();
        var name = record.user.getName();
        var officerLevel = record.user.getOfficer_level();
        var money = record.packet.getMoney();
        var formatStr = Lang.get('red_packet_rain_bullet_des', {
            name: name,
            money: money
        });
        var params = {
            defaultColor: Colors.DARK_BG_ONE,
            defaultSize: 20,
            other: [{ color: Colors.getOfficialColor(officerLevel) }]
        };
        var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
        richText.node.setAnchorPoint(cc.v2(0, 0.5));
        var node = null;
        if (type == RedPacketRainConst.TYPE_BIG) {
            node = UIHelper.newSprite(Path.getRedBagImg('img_danmu')).node;
        } else {
            node = new cc.Node();
        }
        node.setAnchorPoint(cc.v2(0, 0.5));
        node.addChild(richText.node);
        richText.node.setPosition(cc.v2(80, 0));
        var randomPosY = Math.randInt(this._minPosY, this._maxPosY);
        var startPosX = G_ResolutionManager.getDesignWidth();
        var distance = G_ResolutionManager.getDesignWidth() + 500;
        var moveBy = cc.moveBy(10, cc.v2(0 - distance, 0));
        var seq = cc.sequence(moveBy, cc.destroySelf());
        node.setPosition(cc.v2(startPosX, randomPosY));
        this.node.addChild(node);
        node.runAction(seq);
    }
    _stopRequestRankCountDown() {
        if (this._schedulerRequestRank != null) {
            this.unschedule(this._schedulerRequestRank);
            this._schedulerRequestRank = null;
        }
    }
    _requestRankInfo() {
        this._stopRequestRankCountDown();
        this._schedulerRequestRank = this.schedule(function () {
            G_UserData.getRedPacketRain().c2sGetRedPacketRank();
        }, 30);
        this._rankNode.active = (true);
        G_UserData.getRedPacketRain().c2sGetRedPacketRank();
    }
    _updateRankView(listInfo, myInfo) {
        this._rankNode.getComponent(RedPacketRainRankNode).updateUI(listInfo, myInfo);
    }
}