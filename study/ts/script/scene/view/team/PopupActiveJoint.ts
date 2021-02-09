const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SignalConst } from '../../../const/SignalConst';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { G_ConfigLoader, G_EffectGfxMgr, G_SignalManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonContinueNode from '../../../ui/component/CommonContinueNode';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import CommonUI from '../../../ui/component/CommonUI';
import PopupBase from '../../../ui/PopupBase';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { Path } from '../../../utils/Path';
import ActiveJointDesNode from './ActiveJointDesNode';

@ccclass
export default class PopupActiveJoint extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _nodeContinue: CommonContinueNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    private _activeJointDesNode: ActiveJointDesNode;
    private _canContinue: boolean;
    private _heroId1: number;
    private _heroId2: number;
    private _heroUnitData: HeroUnitData;
    private _parentView: any;
    private _iconRes: any;
    private _contentDes: any;

    protected preloadResList = [
        {path:Path.getCommonPrefab("CommonHeroIcon"),type:cc.Prefab},
        {path:Path.getPrefab("ActiveJointDesNode","team"),type:cc.Prefab},
    ];
    onCreate() {

    }

    public setInitData(heroUnitData: HeroUnitData, paView): void {
        this._heroUnitData = heroUnitData;
        this._parentView = paView;
    }
    onEnter() {
        this._canContinue = false;
        this._updateInfo();
        this._nodeContinue.node.active = (false);
        this._playEffect();
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onClickTouch,this);
    }
    onExit() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PopupActiveJoint:onExit');
    }
    _onClickTouch() {
        if (this._canContinue) {
            if (this._parentView && this._parentView.onExitPopupActiveJoint) {
                this._parentView.onExitPopupActiveJoint();
            }
            this.close();
        }
    }
    _updateInfo() {
        var heroConfig = this._heroUnitData.getConfig();
        var baseId = this._heroUnitData.getBase_id();
        var jointType = heroConfig.skill_3_type;
        var jointHeroId = heroConfig.skill_3_partner;
        this._heroId1 = jointType == 1 && baseId || jointHeroId;
        this._heroId2 = jointType == 1 && jointHeroId || baseId;
        var limitLevel = this._heroUnitData.getLimit_level();
        var limitRedLevel = this._heroUnitData.getLimit_rtg()
        var heroRankConfig = HeroDataHelper.getHeroRankConfig(this._heroId1, 0, limitLevel), limitRedLevel;
        if (heroRankConfig == null) {
            heroRankConfig = HeroDataHelper.getHeroRankConfig(this._heroId1, 0, 0, 0);
        }
        this._iconRes = null;
        this._contentDes = null;
        var skillId = heroRankConfig.rank_skill_3;
        if (skillId > 0) {

            var skillActiveConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(skillId);
          //assert((skillActiveConfig, cc.js.formatStr('hero_skill_active config can not find id = %d', skillId));
            this._iconRes = skillActiveConfig.skill_icon;
            var name = skillActiveConfig.name;
            var des = skillActiveConfig.description;
            this._contentDes = Lang.get('team_joint_active_des', {
                name: name,
                des: des
            });
        }
    }
    _playEffect() {
        var effectFunction = function (effect) {
            return this._createActionNode(effect);
        }.bind(this);
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._nodeContinue.node.active = (true);
                this._canContinue = true;
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN, 'PopupActiveJoint');
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_hejijihuo', effectFunction, eventFunction, false);
        effect.node.setPosition(new cc.Vec2(0, 0));
    }
    _createIconNode1() {
        var effectFunction = function (effect) {
            if (effect == 'icon_1') {
                var icon1 = cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonHeroIcon"))).getComponent(CommonHeroIcon) as CommonHeroIcon;
                icon1.updateUI(this._heroId1);
                return icon1.node;
            }
            return new cc.Node();
        }.bind(this);
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var node = new cc.Node();
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_hejijihuo_icon_1', effectFunction, eventFunction, false);
        return node;
    }
    _createIconNode2() {
        var _this = this;
        var effectFunction = function (effect) {
            if (effect == 'icon_2') {
                var icon2 = cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonHeroIcon"))).getComponent(CommonHeroIcon) as CommonHeroIcon;
                icon2.updateUI(_this._heroId2);
                return icon2.node;
            }
            return new cc.Node();
        }.bind(this);
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var node = new cc.Node();
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_hejijihuo_icon_2', effectFunction, eventFunction, false);
        return node;
    }
    _createShouMingNode() {
        var effectFunction = function (effect) {
            if (effect == 'shuoming') {
                var desNode = (cc.instantiate(cc.resources.get(Path.getPrefab("ActiveJointDesNode","team"))) as cc.Node).getComponent(ActiveJointDesNode);
                var imageSkillIcon = desNode._mageSkillIcon;
                var nodeDesPos = desNode._nodeDesPos;
                if (this._iconRes) {
                    imageSkillIcon.node.addComponent(CommonUI).loadTexture(Path.getCommonIcon('skill', this._iconRes));
                }
                if (this._contentDes) {
                    var richText = RichTextExtend.createWithContent(this._contentDes);
                    richText.node.setAnchorPoint(new cc.Vec2(0, 1));
                    //richText.ignoreContentAdaptWithSize(false);
                    richText.maxWidth = 430;
                    nodeDesPos.addChild(richText.node);
                }
                return desNode.node;
            }
            return new cc.Node();
        }.bind(this)
        var eventFunction = function (event) {
            if (event == 'finish') {
            }
        }
        var node = new cc.Node();
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_hejijihuo_shuoming', effectFunction, eventFunction, false);
        return node;
    }
    _createActionNode(effect) {
        if (effect == 'moving_hejijihuo_icon_1') {
            var node = this._createIconNode1();
            return node;
        }
        if (effect == 'moving_hejijihuo_icon_2') {
            var node = this._createIconNode2();
            return node;
        }
        if (effect == 'txt') {
        }
        if (effect == 'moving_hejijihuo_shuoming') {
            var node = this._createShouMingNode();
            return node;
        }
        return new cc.Node();
    }

}