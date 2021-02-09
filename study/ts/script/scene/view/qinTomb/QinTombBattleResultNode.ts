const { ccclass, property } = cc._decorator;

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { Lang } from '../../../lang/Lang';
import { G_EffectGfxMgr } from '../../../init';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import PopupBase from '../../../ui/PopupBase';
import { QinTombConst } from '../../../const/QinTombConst';

@ccclass
export default class QinTombBattleResultNode extends PopupBase {

    @property({ type: cc.Sprite, visible: true })
    _bkImage: cc.Sprite = null;

    @property({ type: CommonHeroIcon, visible: true })
    _heroIcon1: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame1: CommonHeadFrame = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect1: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _heroName1: cc.Label = null;


    private _srcType;
    private _reportValue;
    private _result;

    public init(index)
    {
        this.setNotCreateShade(true);
    }

    public updateUI(reportValue, srcType, result) {
        this._srcType = srcType;
        if (reportValue == null) {
            this.updateHeroEmpty();
            return;
        }
        this._reportValue = reportValue;
        this._result = result;
        this.updateHeroEmpty();
        this.updateHeroIcon(reportValue);
    }

    public updateHeroEmpty() {
        this._heroIcon1.refreshToEmpty(true);
        this._heroName1.string = (Lang.get('qin_tomb_empty'));
        this._heroIcon1.node.active = (true);
        this._heroName1.node.active = (true);
    }

    public _updateIconDarkEffect() {
        if (this._heroIcon1.isIconDark() == true) {
            G_EffectGfxMgr.createPlayGfx(this._nodeEffect1, 'effect_xianqinhuangling_jibai');
        }
    }

    public updateNodeState() {
        if (this._srcType == 'attack') {
            UIHelper.loadTexture(this._bkImage, Path.getQinTomb('img_qintomb_battle01'));
            this._heroName1.node.color = (cc.Color.BLUE);
        } else {
            UIHelper.loadTexture(this._bkImage, Path.getQinTomb('img_qintomb_battle02'));
            this._heroName1.node.color = (cc.Color.RED);
        }
        if (this._result == 1) {
            this._heroIcon1.setIconDark(true);
            this._heroName1.node.color = (cc.Color.GRAY);
            if (this._srcType == 'attack') {
                UIHelper.loadTexture(this._bkImage, Path.getQinTomb('img_qintomb_battle01b'));
            } else {
                UIHelper.loadTexture(this._bkImage, Path.getQinTomb('img_qintomb_battle02b'));
            }
        } else {
            this._heroIcon1.setIconDark(false);
        }
        this._updateIconDarkEffect();
    }

    public updateHeroIcon(teamUserInfo) {
        var [avatarBaseId, avatarTable] = UserDataHelper.convertAvatarId(teamUserInfo);
        var heroIcon = this._heroIcon1;
        if (avatarBaseId > 0) {
            heroIcon.updateIcon(avatarTable);
        }
        var commonHeadFrame1 = this._commonHeadFrame1;
        if (teamUserInfo != null) {
            commonHeadFrame1.updateUI(teamUserInfo.head_frame_id, heroIcon.node.scale)
        }
        var heroName = this._heroName1;
        heroName.string = (teamUserInfo.name);
        heroIcon.node.active = (true);
        heroName.node.active = (true);
    }

    public onEnter() {
    }

    public onExit() {
    }

    public showResult(finishCallBack) {
        this.open();
        let banziCallBack = function(eventName, frameIndex, node) {
            if (eventName == 'finish') {
                var action1 = cc.delayTime(QinTombConst.TEAM_BATTLE_RESULT_SHOW_TIME);
                var action2 = cc.callFunc(function () {
                    function effectClose(eventName) {
                        if (eventName == 'finish') {
                            var action1 = cc.delayTime(0.5);
                            var action2 = cc.callFunc(function () {
                                this.close();
                            });
                            var action = cc.sequence(action1, action2);
                            this.node.runAction(action);
                        }
                    }
                    G_EffectGfxMgr.applySingleGfx(this.node, 'smoving_xianqinhuangling_banzi2', effectClose, null, null);
                });
                this.updateIconDarkEffect();
                var action = cc.sequence(action1, action2);
                this.node.runAction(action);
            }
        }.bind(this);
        G_EffectGfxMgr.applySingleGfx(this.node, 'smoving_xianqinhuangling_banzi', banziCallBack, null, null);
        if (finishCallBack) {
            finishCallBack();
        }
    }
}