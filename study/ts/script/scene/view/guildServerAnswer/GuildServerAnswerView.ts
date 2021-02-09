const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { GuildAnswerConst } from '../../../const/GuildAnswerConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_AudioManager, G_EffectGfxMgr, G_ResolutionManager, G_SignalManager, G_UserData } from '../../../init';
import { EffectGfxType } from '../../../manager/EffectGfxManager';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { SpineNode } from '../../../ui/node/SpineNode';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import GuildServerAnswerAvatarLayer from './GuildServerAnswerAvatarLayer';
import { GuildServerAnswerHelper } from './GuildServerAnswerHelper';
import GuildServerAnswerNode from './GuildServerAnswerNode';
import GuildServerAnswerRankLayer from './GuildServerAnswerRankLayer';


// import CommonChatMiniNode from '../chat/CommonChatMiniNode'

@ccclass
export default class GuildServerAnswerView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _scrollBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

       @property({
           type: CommonMiniChat,
           visible: true
       })
       _chatMini: CommonMiniChat = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _buttonHelp: CommonHelp = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePopup: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEndEffect: cc.Node = null;

    public static readonly TITLE_IMAGE_RES = 'txt_sys_com_quanfudati';
    public static readonly BG_RES_HEAD = 'left_bg';
    public static readonly BG_RES_MID = 'mid_bg';
    public static readonly BG_RES_TAIL = 'right_bg';
    public static readonly BG_WIDTH = 348;
    public static readonly SPEED = 400;
    public static readonly LAST_DELAY = 0.1;
    public static readonly END_SPINE_NAME = 'quanfudatizhongdian';
    _signalEventGuildServerAnswerUpdateState;
    _signalAllDataReady;
    _signalEnter;
    _maxSlide: any;
    _bgList: any[] = [];
    _startGo: any;
    _isLastQues: any;
    _delay: any;
    _nextDo: any;
    _subLayers: any[] = [];

    protected preloadEffectList = [
        {
            type: EffectGfxType.MovingGfx,
            name: "moving_quanfudati_ganning"
        },
        {
            type: EffectGfxType.MovingGfx,
            name: "moving_quanfudati_huangyueying"
        },
        {
            type: EffectGfxType.MovingGfx,
            name: "moving_quanfudati_lvbu"
        }
    ]

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, answerData) {
            var data: Array<ResourceData> = [
                {path: "prefab/guildServerAnswer/GuildServerAnswerAvatarLayer", type: cc.Prefab},
                {path: "prefab/guildServerAnswer/GuildServerAnswerRankLayer", type: cc.Prefab},
                {path: "prefab/guildServerAnswer/GuildServerAnswerNode", type: cc.Prefab},
                {path: "prefab/guildServerAnswer/GuildServerAnswerAvatar", type: cc.Prefab},
                {path: "prefab/guildServerAnswer/GuildServerAnswerRankCell", type: cc.Prefab},
            ];
            ResourceLoader.loadResArrayWithType(data, (err, data) => {
                callBack();
            });
        }
        G_UserData.getGuildServerAnswer().c2sEnterNewGuildAnswer();
        return G_SignalManager.addOnce(SignalConst.EVENT_GUILD_ENTER_NEW_ANSWER, onMsgCallBack);
    }
    onCreate() {
        this._initUI();
        this._resetListBG();
    }
    _initUI() {
        var answerAvatarLayer = Util.getNode("prefab/guildServerAnswer/GuildServerAnswerAvatarLayer", GuildServerAnswerAvatarLayer) as GuildServerAnswerAvatarLayer;
        this._panelContent.addChild(answerAvatarLayer.node);
        this._subLayers[GuildAnswerConst.ANSWER_AVATAR_LAYER] = answerAvatarLayer;
        var answerRanklayer = Util.getNode("prefab/guildServerAnswer/GuildServerAnswerRankLayer", GuildServerAnswerRankLayer) as GuildServerAnswerRankLayer;
        this._panelContent.addChild(answerRanklayer.node);
        answerRanklayer.node.setContentSize(G_ResolutionManager.getDesignWidth(),G_ResolutionManager.getDesignHeight());
        answerRanklayer.node.x = 0;
        answerRanklayer.node.y = 0;
        this._subLayers[GuildAnswerConst.ANSWER_RANK_LAYER] = answerRanklayer;
        var answerNode = Util.getNode("prefab/guildServerAnswer/GuildServerAnswerNode", GuildServerAnswerNode) as GuildServerAnswerNode;
        this._nodePopup.addChild(answerNode.node);
        this._subLayers[GuildAnswerConst.ANSWER_NODE] = answerNode;
        this._topbarBase.setImageTitle(GuildServerAnswerView.TITLE_IMAGE_RES);
        this._topbarBase.hideBG();
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_SERVER_ANSWER);
        this._buttonHelp.updateLangName('guild_server_answer_help');

        this._chatMini.getPanelDanmu().active = false;
    }
    onEnter() {
        this._signalEventGuildServerAnswerUpdateState = G_SignalManager.add(SignalConst.EVENT_GUILD_SERVER_ANSWER_UPDATE_STATE, handler(this, this._onEventAnswerUpdateState));
        this._signalAllDataReady = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(this, this._onAllDataReady));
        this._signalEnter = G_SignalManager.add(SignalConst.EVENT_GUILD_ENTER_NEW_ANSWER, handler(this, this._onEventEnterView));
        this._updateState(true);
        G_AudioManager.playMusicWithId(AudioConst.MUSCI_NEW_ANSWER);
    }
    onExit() {
        // this.unscheduleUpdate();
        this.unscheduleAllCallbacks();
        this._signalEventGuildServerAnswerUpdateState.remove();
        this._signalEventGuildServerAnswerUpdateState = null;
        this._signalAllDataReady.remove();
        this._signalAllDataReady = null;
        this._signalEnter.remove();
        this._signalEnter = null;
    }
    _resetListBG() {
        var size = this.node.getContentSize();
        this._maxSlide = Math.ceil(size.width / GuildServerAnswerView.BG_WIDTH) + 2;
        var posx = 0;
        var offsetX = 0;
        for (var i = 1; i <= this._maxSlide; i++) {
            var imageBg = this._bgList[i] as cc.Sprite;
            if (!imageBg) {
                imageBg = (new cc.Node()).addComponent(cc.Sprite) as cc.Sprite;
                imageBg.node.setAnchorPoint(cc.v2(0, 0.5));
                this._bgList[i] = imageBg;
                this._scrollBg.addChild(imageBg.node);
            }
            imageBg.node.removeAllChildren();
            var resName = GuildServerAnswerView.BG_RES_MID;
            if (i == 1) {
                resName = GuildServerAnswerView.BG_RES_HEAD;
            }
            if (imageBg.name != resName) {
                UIHelper.loadTexture(imageBg, Path.getAnswerBg(resName))
            }
            imageBg.node.name = (resName);
            imageBg.node.x = (posx + offsetX);
            offsetX = offsetX + GuildServerAnswerView.BG_WIDTH;
        }
    }
    update(dt: number) {
        if (this._startGo) {
            var offsetx = GuildServerAnswerView.SPEED * dt;
            this._updateBgList(offsetx);
            if (this._isLastQues) {
                this._delay = this._delay + dt;
            }
        }
    }
    _updateBgList(offsetX) {
        var size = this.node.getContentSize();
        var state = G_UserData.getGuildServerAnswer().getAnswerState();
        var curNo = GuildServerAnswerHelper.getCurrentVisibleQuesNo();
        var waitTime = GuildAnswerConst.EFFECT_TIME + GuildAnswerConst.FACE_TIME;
        for (var i = 1; i <= this._maxSlide; i++) {
            var posx = this._bgList[i].node.x;
            var width = this._bgList[i].node.getContentSize().width;
            if (posx + width < 0) {
                if (this._isLastQues && this._delay >= waitTime) {
                    UIHelper.loadTexture(this._bgList[i], Path.getAnswerBg(GuildServerAnswerView.BG_RES_TAIL));
                    this._bgList[i].node.name = (GuildServerAnswerView.BG_RES_TAIL);
                    this._attachLastMoving(this._bgList[i].node);
                    this._isLastQues = false;
                    this._delay = 0;
                } else if (curNo == GuildAnswerConst.WAVE_MAX_NUMS && state == GuildAnswerConst.ANSWER_STATE_RESTING && !this._nextDo) {
                    this._isLastQues = true;
                    this._delay = 0;
                    this._nextDo = true;
                } else if (this._bgList[i].node.name == GuildServerAnswerView.BG_RES_HEAD) {
                    UIHelper.loadTexture(this._bgList[i], Path.getAnswerBg(GuildServerAnswerView.BG_RES_MID));
                    this._bgList[i].name = (GuildServerAnswerView.BG_RES_MID);
                }
                posx = this._getMaxBgPosX() + GuildServerAnswerView.BG_WIDTH;
                this._bgList[i].node.x = (posx);
            } else if (posx + width <= size.width + offsetX * 2) {
                if (this._bgList[i].node.name == GuildServerAnswerView.BG_RES_TAIL) {
                    this._startGo = false;
                    this._nextDo = false;
                    this._subLayers[GuildAnswerConst.ANSWER_AVATAR_LAYER].enterAllAvatarWin();
                    this._playDestinationEffect(this._bgList[i].node);
                }
            }
            this._bgList[i].node.x = (posx - offsetX);
        }
    }
    _attachLastMoving(node) {
        if (!GuildServerAnswerHelper.isHaveRightAnswerPlayer()) {
            return;
        }
        var createSpineNode = function () {
            var curQues: any = G_UserData.getGuildServerAnswer().getCurQuestion();
            var posy = 0;
            if (curQues.getRightAnswer() == GuildAnswerConst.LEFT_SIDE) {
                posy = 450;
            } else {
                posy = 180;
            }
            var spineNode = SpineNode.create();
            spineNode.setAsset(Path.getEffectSpine(GuildServerAnswerView.END_SPINE_NAME));
            spineNode.node.setPosition(cc.v2(0, posy));
            spineNode.setAnimation('effect1', true);
            spineNode.node.name = (GuildServerAnswerView.END_SPINE_NAME);
            return spineNode;
        }.bind(this);
        var spinenode = createSpineNode();
        node.addChild(spinenode);
    }
    _getMaxBgPosX() {
        var maxX = 0;
        for (var i = 1; i <= this._maxSlide; i++) {
            var posx = this._bgList[i].node.x;
            if (posx > maxX) {
                maxX = posx;
            }
        }
        return maxX;
    }
    _onEventEnterView() {
        this._updateState();
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, { flag: 1 });
    }
    _onEventAnswerUpdateState(id, state) {
        G_UserData.getGuildServerAnswer().c2sEnterNewGuildAnswer();
        this._updateState();
        G_SignalManager.dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, { flag: 1 });
    }
    _onAllDataReady() {
        G_UserData.getGuildServerAnswer().c2sEnterNewGuildAnswer();
    }
    /**
     * 更新状态
     * @param enter 
     */
    _updateState(enter?) {
        var state = G_UserData.getGuildServerAnswer().getAnswerState();
        if (state == GuildAnswerConst.ANSWER_STATE_PLAYING || state == GuildAnswerConst.ANSWER_STATE_RESTING) {
            var no = GuildServerAnswerHelper.getCurrentVisibleQuesNo();
            if (state == GuildAnswerConst.ANSWER_STATE_RESTING && enter && no == 10) {
                this._goIdle();
            } else if (state == GuildAnswerConst.ANSWER_STATE_PLAYING && enter && no == 10) {
                this._setResAllMid();
                this._goRun();
            } else {
                this._goRun();
            }
        } else {
            this._startGo = false;
            var need = GuildServerAnswerHelper.needReset();
            if (need) {
                this._resetListBG();
            }
        }
        this._subLayers[GuildAnswerConst.ANSWER_NODE].updateUI(state);
    }
    _goRun() {
        this._startGo = true;
        this._subLayers[GuildAnswerConst.ANSWER_AVATAR_LAYER].enterAllAvatarRun();
    }
    _goIdle() {
        this._startGo = false;
        this._subLayers[GuildAnswerConst.ANSWER_AVATAR_LAYER].enterAllAvatarIdle();
    }
    _setResAllMid() {
        for (var i = 1; i <= this._maxSlide; i++) {
            var imageBg = this._bgList[i];
            if (imageBg) {
                UIHelper.loadTexture(imageBg, Path.getAnswerBg(GuildServerAnswerView.BG_RES_MID));
            }
        }
    }
    _playDestinationEffect(node) {
        if (!GuildServerAnswerHelper.isHaveRightAnswerPlayer()) {
            return;
        }
        var spineNode = node.getChildByName(GuildServerAnswerView.END_SPINE_NAME);
        if (spineNode) {
            spineNode.setAnimation('effect2', false);
            G_EffectGfxMgr.createPlayMovingGfx(spineNode, 'moving_quanfudatizhongdian_shengli', null, null);
        }
    }

}