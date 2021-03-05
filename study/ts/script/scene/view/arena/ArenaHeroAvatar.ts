const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import { Colors, G_UserData, G_Prompt, G_AudioManager, G_SignalManager, G_EffectGfxMgr } from '../../../init';
import { TextHelper } from '../../../utils/TextHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import UIHelper from '../../../utils/UIHelper';
import { AudioConst } from '../../../const/AudioConst';
import { SignalConst } from '../../../const/SignalConst';
import { ArenaHelper } from './ArenaHelper';

@ccclass
export default class ArenaHeroAvatar extends ViewBase {

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textUserName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPowerDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPowerValue: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnSweep: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelf: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _top_info_panel: cc.Node = null;


    private _callBackFunc: any;
    private _arenaPlayer: any;

    onLoad() {
        super.onLoad();
        this._commonHeroAvatar.init();
    }

    onCreate() {
        this._btnSweep.node.active = (false);
        this._imageSelf.node.active = (false);
        // this._btnSweep.addClickEventListenerEx(handler(this, this._onButtonSweep));
    }
    turnBack() {
        this._commonHeroAvatar.turnBack();
    }
    updateBaseId(baseId) {
        this._commonHeroAvatar.updateUI(baseId);
    }
    updateAnimation(baseId) {
        this._commonHeroAvatar.updateUI(baseId);
        this.hideTopInfo();
        this.showShadow(false);
    }
    getBaseId() {
        return this._commonHeroAvatar.getBaseId();
    }
    isSelf() {
        if (this._arenaPlayer.uid == G_UserData.getBase().getId()) {
            return true;
        }
        return false;
    }
    getUserId() {
        return this._arenaPlayer.uid;
    }
    updateAvatar(arenaPlayer, callBackFunc) {
        //防止没有init
        this._commonHeroAvatar.init();

        if (arenaPlayer == null) {
            return;
        }
        this._arenaPlayer = arenaPlayer;
        this._commonHeroAvatar.setTouchEnabled(true);
        this._commonHeroAvatar.updateAvatar(arenaPlayer.baseTable);
        this._commonHeroAvatar.setUserData(arenaPlayer);
        this._commonHeroAvatar.setCallBack(callBackFunc);
        this._textUserName.string = arenaPlayer.name;
        this._textUserName.node.color = Colors.getOfficialColor(arenaPlayer.officialLevel-1);
        UIHelper.enableOutline(this._textUserName, Colors.getOfficialColorOutline(arenaPlayer.officialLevel));

        this._textPowerValue.string = (TextHelper.getAmountText(arenaPlayer.power));
        var myRank = G_UserData.getArenaData().getArenaRank();
        var arenaRank = arenaPlayer.rank;
        if (this.isSelf()) {
            this.checkFristBattle();
        } else {
            var nodeRank = this._top_info_panel.getChildByName('Node_rank');
            if (nodeRank) {
                ArenaHelper.updateArenaRank(nodeRank, arenaRank);
            }
        }
        this._btnSweep.node.active = (false);
        if (myRank < this._arenaPlayer.rank && LogicCheckHelper.funcIsShow(FunctionConst.FUNC_ARENA_SWEEP)) {
            this._btnSweep.node.active = (true);
        }
        if (this.isSelf()) {
            this._imageSelf.node.active = (true);
        } else {
            this._imageSelf.node.active = (false);
            this._callBackFunc = callBackFunc;
        }
    }
    doCallBackFunc() {
        if (this._callBackFunc && typeof (this._callBackFunc) == 'function') {
            this._callBackFunc(this._arenaPlayer, false);
        }
    }
    checkFristBattle() {
        var myRank = G_UserData.getArenaData().getArenaRank();
        var isFirst = G_UserData.getArenaData().getArenaFirstBattle();
        if (isFirst == 1) {
            myRank = 0;
        }
        var nodeRank = this._top_info_panel.getChildByName('Node_rank');
        if (nodeRank) {
            ArenaHelper.updateArenaRank(nodeRank, myRank);
        }
    }
    hideTopInfo() {
        var topInfoPanel = this.node.getChildByName('top_info_panel');
        topInfoPanel.active = (false);
    }
    playAnimation(actionName, loop?) {
        this._commonHeroAvatar.setAction(actionName, loop);
    }
    showShadow(needShow) {
        this._commonHeroAvatar.showShadow(needShow);
    }
    getArenaPlayer() {
        return this._arenaPlayer;
    }
    onEnter() {
    }
    onExit() {
    }
    playJumpEffect() {
    }
    private onButtonSweep(sender) {
        var [isOpen, desc, funcInfo] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ARENA_SWEEP);
        if (!isOpen) {
            G_Prompt.showTip(desc);
            return;
        }
        if (this._callBackFunc && typeof (this._callBackFunc) == 'function') {
            this._callBackFunc(this._arenaPlayer, true);
        }
    }
    playWinEffect(callBack?) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_ARENA_WIN);
        cc.warn('show win playWinEffect start');
        var eventFunction = function (event) {
            if (event == 'finish') {
                cc.warn('show win playWinEffect finish');
                G_SignalManager.dispatch(SignalConst.EVENT_ARENA_WIN_POPUP_AWARD);
            }
        }.bind(this)
        var parent = this.node.getParent().getParent();
        var worldPos = this._nodeEffect.convertToWorldSpaceAR(new cc.Vec2(0, 0));
        var gfxEffect = G_EffectGfxMgr.createPlayGfx(parent, 'effect_fudaokaiqi_lihua', eventFunction);
        var baseId = this.getBaseId();
        if (baseId < 100) {
            this._commonHeroAvatar.setAction('win_pvp', false);
        }
        var gfxPos = parent.convertToNodeSpaceAR(worldPos);
        gfxEffect.node.setPosition(gfxPos);
    }

}