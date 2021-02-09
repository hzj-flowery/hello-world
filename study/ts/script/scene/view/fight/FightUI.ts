import { Path } from "../../../utils/Path";
import { CONFIG_JUMP_BATTLE_ENABLE } from "../../../debug/DebugConfig";
import { G_EffectGfxMgr, G_ConfigLoader, G_UserData, G_Prompt, G_ConfigManager } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { FightConfig } from "../../../fight/FightConfig";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FightSignalManager } from "../../../fight/FightSignalManager";
import { FightSignalConst } from "../../../fight/FightSignConst";
import ViewBase from "../../ViewBase";
import CustomNumLabel from "../../../ui/number/CustomNumLabel";
import CommonMiniChat from "../../../ui/component/CommonMiniChat";
import { FunctionConst } from "../../../const/FunctionConst";
import ALDStatistics from "../../../utils/ALDStatistics";
import { config } from "../../../config";

const { ccclass, property } = cc._decorator;

// import CommonChatMiniNode from '../chat/CommonChatMiniNode'

@ccclass
export default class FightUI extends ViewBase {
    @property({ type: cc.Node, visible: true })
    _nodeLeft: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textBoxNum: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _image_ACC_BG: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSpeed: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeRight: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textRound: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageJump: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTipsBg: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textTips: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _panelFourBtn: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _button1: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _button2: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _button3: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _button4: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _textSpeed: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _button5: cc.Button = null;

    @property({ type: CommonMiniChat, visible: true })
    _commonChat: CommonMiniChat = null;

    @property({ type: cc.Sprite, visible: true })
    _imageJumpStory: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTotalDamage: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeSkill2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeSkill1: cc.Node = null;

    private static HIDE_TOTAL_TIME = 0.4;

    private _totalNum: CustomNumLabel;
    private _totalHeal: CustomNumLabel;
    private _showLabel: CustomNumLabel;

    private _speedCallback: Function;
    private _battleSpeed: number;
    private _hideStartTime: number;
    private _startHide: boolean;


    private jumpCallback: Function;

    private _isCanJumpByLv: boolean = false;


    updateCanJump() {
        var cfg = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_JUMP_FIGHT);
        var canPassLv = cfg.level;
        if (G_UserData.getBase().getLevel() >= canPassLv || G_UserData.getBase().getRecharge_total() > 0) {
            this._isCanJumpByLv = true;
        } else {
            if (this._textTips) {
                var tips:string = cfg.comment;
                if (!G_ConfigManager.checkCanRecharge()) {
                    tips = tips.slice(3, tips.length);
                }
                this._textTips.string = tips;
            }
        }
    }


    onCreate() {
        this._battleSpeed = 1;
        this._hideStartTime = 0;
        this._textBoxNum.string = "0";
        if (CONFIG_JUMP_BATTLE_ENABLE) {
            this._panelFourBtn.active = true;
        } else {
            this._panelFourBtn.active = false;
        }
        this._totalNum = new cc.Node("_totalNum").addComponent(CustomNumLabel)
        this._totalNum.init('num_battle_hit', Path.getBattleDir(), 0, CustomNumLabel.SIGN_NO, null, true);
        this._imageTotalDamage.node.addChild(this._totalNum.node);
        this._totalNum.node.setPosition(0, 0);

        this._totalHeal = new cc.Node("_totalHeal").addComponent(CustomNumLabel)
        this._totalHeal.init('num_battle_heal', Path.getBattleDir(), 0, CustomNumLabel.SIGN_NO, null, true);
        this._imageTotalDamage.node.addChild(this._totalHeal.node);
        this._totalHeal.node.setPosition(0, 0);

        this._commonChat.setDanmuVisible(false);
        this.hideTotalHurt();

    }

    public onEnter() {
        // this.node.setPosition(0, 0);
        // var posLeft = G_ResolutionManager.getBangOffset();
        // this._nodeLeft.x = -G_ResolutionManager.getDesignCCSize().width / 2 + posLeft;
        // var posRight = G_ResolutionManager.getDesignCCSize().width / 2 - posLeft;
        // this._nodeRight.x = posRight;
    }

    public onExit() {

    }

    public setSpeedVisible(s) {
        this._imageSpeed.node.active = s;
        this._image_ACC_BG.node.active = s;
    }

    public setSpeedCallback(callback: Function) {
        this._speedCallback = callback;
    }

    public refreshSpeed(speed) {
        var image = Path.getBattleRes('btn_battle_acc0' + speed);
        UIHelper.loadTexture(this._imageSpeed, image);
    }



    public onJumpTouch(e) {
        // if (!this._isFightCanJump && e.target.name != '_imageJumpStory' && !this._isCanJumpByLv) {
        //     G_Prompt.showTip(this._commenet);
        // }

        if (CONFIG_JUMP_BATTLE_ENABLE && this._battleSpeed == 0) {
            this._battleSpeed = 1;
        }
        if (this.jumpCallback) {
            this.jumpCallback();
        }
        this.node.active = false;
        if (!this._imageTipsBg) {
            ALDStatistics.instance.aldSendEvent('Cg_跳过剧情');
        }
    }

    public setJumpVisible(v) {
        if (CONFIG_JUMP_BATTLE_ENABLE) {
            this._imageJump.node.active = true;
        } else {
            this._imageJump.node.active = v || this._isCanJumpByLv;
        }
        if (this._imageTipsBg) {
            this._imageTipsBg.node.active = !this._imageJump.node.active;
        }
    }

    public setJumpCallback(callback: Function) {
        this.jumpCallback = callback;
    }

    public onSpeedTouch() {
        this._speedCallback();
    }

    public setItemCount(count) {
        this._textBoxNum.string = (count);
    }

    public updateRound(round, maxRound) {
        this._textRound.string = (round + ('/' + maxRound));
        if (round >= FightConfig.SHOW_JUMP_ROUND) {
            this._imageJump.node.active = true;
            if (this._imageTipsBg) {
                this._imageTipsBg.node.active = !this._imageJump.node.active;
            }
        }
    }

    public onSlow() {
        if (this._battleSpeed > 0) {
            this._battleSpeed = this._battleSpeed / 2;
            this._speedCallback(this._battleSpeed);
            this._textSpeed.string = this._battleSpeed.toString();
        }
    }

    public onFast() {
        this._battleSpeed = this._battleSpeed * 2;
        this._speedCallback(this._battleSpeed);
        this._textSpeed.string = this._battleSpeed.toString();
    }

    public revert() {
        this._battleSpeed = 1;
        this._speedCallback(this._battleSpeed);
        this._textSpeed.string = this._battleSpeed.toString();
    }

    public pause() {
        if (this._battleSpeed != 0) {
            this._battleSpeed = 0;
        } else {
            this._battleSpeed = 1;
        }
        this._speedCallback(this._battleSpeed);
        this._textSpeed.string = this._battleSpeed.toString();
    }

    private _refreshTotalLabel(type) {
        this._totalNum.node.active = false;
        this._totalHeal.node.active = false;
        if (type == 1) {
            UIHelper.loadTexture(this._imageTotalDamage, Path.getBattleFont('txt_allheal_bg'));
            this._totalHeal.node.active = true;
            this._showLabel = this._totalHeal;
        } else if (type == -1) {
            UIHelper.loadTexture(this._imageTotalDamage, Path.getBattleFont('txt_alldamage_bg'));
            this._totalNum.node.active = true;
            this._showLabel = this._totalNum;
        }
    }

    _convertHurt(val) {
        var convertType = 0;
        if (config.CONFIG_SHOW_BATTLEHURT_CONVERT) {
            return [
                val,
                convertType
            ];
        }
        if (Math.abs(val) > 100000000) {
            if (val < 0) {
                convertType = -1;
                val = -Math.floor(Math.abs(val) / 10000);
            } else {
                convertType = 1;
                val = Math.floor(val / 10000);
            }
        }
        return [
            val,
            convertType
        ];
    }

    public updateTotalHurt(val, type) {
        var [val, convertType] = this._convertHurt(val);
        this._refreshTotalLabel(type);
        this._imageTotalDamage.node.active = true;
        var action1 = cc.scaleTo(0.05, 1.5);
        var action2 = cc.callFunc(function () {
            this._showLabel.setNumber(val, convertType);
        }.bind(this));
        var action3 = cc.scaleTo(0.05, 1);
        var action = cc.sequence(action1, action2, action3);
        this._showLabel.node.runAction(action);
    }

    public hideTotalHurt() {
        this._hideStartTime = 0;
        this._startHide = true;
        this._imageTotalDamage.node.active = false;
    }

    public update(f) {
        if (this._startHide) {
            if (this._hideStartTime >= FightUI.HIDE_TOTAL_TIME) {
                this._imageTotalDamage.node.active = false;
                this._totalNum.setNumber(0);
                this._totalHeal.setNumber(0);
                this._startHide = false;
            } else {
                this._hideStartTime = this._hideStartTime + f;
            }
        }
    }

    public closeChatUI() {
        // TODO:
        // var isMiniInRecordVoice = this._commonChat.isInRecordVoice();
        // if (!isMiniInRecordVoice) {
        //     G_SignalManager.dispatch(SignalConst.EVENT_VOICE_RECORD_CHANGE_NOTICE, true);
        // }
        // var chatMainView = G_SceneManager.getRunningScene().getPopupByName('ChatMainView');
        // if (chatMainView) {
        //     chatMainView.forceClose();
        // }
        // var popupUserBaseInfo = G_SceneManager.getRunningScene().getPopupByName('PopupUserBaseInfo');
        // if (popupUserBaseInfo) {
        //     popupUserBaseInfo.close();
        // }
        // var popupUserDetailInfo = G_SceneManager.getRunningScene().getPopupByName('PopupUserDetailInfo');
        // if (popupUserDetailInfo) {
        //     popupUserDetailInfo.close();
        // }
        // var popupChatSetting = G_SceneManager.getRunningScene().getPopupByName('PopupChatSetting');
        // if (popupChatSetting) {
        //     popupChatSetting.close();
        // }
        // var chatVoiceView = G_SceneManager.getRunningScene().getVoiceViewByName('ChatVoiceView');
        // if (!isMiniInRecordVoice && chatVoiceView) {
        //     chatVoiceView.close();
        // }
    }

    public setJumpStoryVisible(v) {
        this._imageJumpStory.node.active = v;
    }

    public setPanelVisible(v) {
        this._nodeLeft.active = v;
        this._nodeRight.active = v;
        this._commonChat.node.active = v;
    }

    public playSkillAnim(camp, anim, petId, color) {
        var node = this['_nodeSkill' + camp];
        if (node) {
            G_EffectGfxMgr.createPlayMovingGfx(node, anim, this.effectFunction.bind(this, petId, color), null, true);
        }
    }

    private effectFunction(petId, color, effect) {
        if (effect == 'shenshou_zi_sb') {
            var pic = Path.getSkillShow(petId + '_z');
            var image = UIHelper.newSprite(pic);
            return image.node;
        } else if (effect == 'shenshou_tu_sb') {
            var pic = Path.getBattlePet(petId + '_s');
            var image = UIHelper.newSprite(pic);
            return image.node;
        } else if (effect == 'shenshou_pinzhi_sb') {
            var pic = Path.getBattlePet(FightConfig.PET_COLOR_BG[color - 1]);
            var image = UIHelper.newSprite(pic);
            return image.node;
        }
    }

    public playHistoryAnim(hisCamp, hisId, skillShowId, stageId) {
        function effectFunction(effect) {
            //TODO:
            // if (effect == 'weizi') {
            //     var skillShow = HeroSkillPlay.get(skillShowId);
            //     var image = Path.getSkillShow(skillShow.txt);
            //     var sprite = UIHelper.newSprite(image);
            //     return sprite;
            // } else if (effect == 'lihui') {
            //     var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonStoryAvatar', 'common'));
            //     var resId = heroData.res_id;
            //     avatar.updateUIByResId(resId);
            //     return avatar;
            // } else if (effect == 'texiao') {
            //     var spineNode = new (require('SpineNode'))(1);
            //     spineNode.setAsset(Path.getFightEffectSpine(heroResData.hero_show_effect));
            //     spineNode.setAnimation('effect');
            //     return spineNode;
            // }
        }
        function eventFunction(event) {
            if (event == 'skill') {
                fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_HISTORY_BUFF, stageId);
            } else if (event == 'finish') {
                fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_HISTORY_SHOW_END, stageId);
            }
        }
        this.node.active = true;
        var HistoricalHero = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO);
        var HeroSkillPlay = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY);
        var HeroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
        var fightSignalManager = FightSignalManager.getFightSignalManager();
        var heroData = HistoricalHero.get(hisId);
        var heroResData = HeroRes.get(heroData.res_id);
        var anim = FightConfig.getHistoryAnimShow(heroData.color, hisCamp);
        var node = this['_nodeSkill' + hisCamp];
        if (node) {
            G_EffectGfxMgr.createPlayMovingGfx(node, anim, effectFunction.bind(this), eventFunction, true);
        }
    }
}