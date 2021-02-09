import CommonContinueNode from "../../../ui/component/CommonContinueNode";

import { Path } from "../../../utils/Path";

import { G_ResolutionManager, G_EffectGfxMgr, G_SceneManager, G_ConfigLoader } from "../../../init";

import EffectGfxNode from "../../../effect/EffectGfxNode";

import { Lang } from "../../../lang/Lang";
import { ConfigManager } from "../../../manager/ConfigManager";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import UIHelper from "../../../utils/UIHelper";
import HeroShow from "../heroShow/HeroShow";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import ViewBase from "../../ViewBase";
import { SceneIdConst } from "../../../const/SceneIdConst";
import { MilitaryMasterPlanHelper } from "../militaryMasterPlan/MilitaryMasterPlanHelper";
import { MilitaryMasterPlanView } from "../militaryMasterPlan/MilitaryMasterPlanView";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HeroMerge extends ViewBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textGetDetail: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGetBG: cc.Sprite = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _nodeContinue: CommonContinueNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageBG: cc.Node = null;
    @property({ type: cc.Prefab, visible: true })
    _avatarPrefab: cc.Prefab = null;

    _count: any;
    _isAnimFinish: boolean;
    _heroData: any;


    ctor(heroId, count) {
        this._count = count || 1;
        this._isAnimFinish = false;
        this._heroData = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId);
        UIHelper.addEventListenerToNode(this.node, this._imageBG, 'HeroMerge', '_onImageBGTouch');
    }
    onCreate() {
        this.setSceneSize();
        this.updateSceneId(SceneIdConst.SCENE_ID_DRAW_CARD);
        var params = G_SceneManager.getViewArgs('heroMerge');
        this.ctor(params[0], params[1]);
        this._nodeContinue.node.active = (false);
        this._imageGetBG.node.active = (false);
        this._textGetDetail.node.active = (false);
    }
    onEnter() {
        this._playHeroOpen();
    }
    onExit() {
        let color = this._heroData["color"];
        if(MilitaryMasterPlanHelper.isOpen(MilitaryMasterPlanHelper.Type_HeroMerge,color))
        {
            G_SceneManager.showDialog("prefab/militaryMasterPlan/MilitaryMasterPlanView",function(pop:MilitaryMasterPlanView){
                pop.setInitData(MilitaryMasterPlanHelper.Type_HeroMerge);
                pop.openWithAction();
            });
        }
    }
    _playHeroOpen() {
        this._imageGetBG.node.active = (true);
        if (this._heroData.color >= 4) {
            var node1 = new cc.Node();
            var heroShow = node1.addComponent(HeroShow) as HeroShow;
            heroShow.create(this._heroData.id, function () {
                this._playAvatarOpen();
            }.bind(this));
        } else {
            this._playAvatarOpen();
        }
    }
    _playAvatarOpen() {
        let effectFunction = function (effect) {
            if (effect == 'card_lv') {
                var card = this._createCard(this._heroData.color);
                return card;
            } else if (effect == 'hero_come') {
                var avatar = (cc.instantiate(this._avatarPrefab) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                avatar.init();
                avatar.updateUI(this._heroData.id);
                avatar.showName(true);
                avatar.showCountry(true);
                avatar.scheduleOnce(function () {
                    avatar._playAnim("idle", true);
                }, 2)
                return avatar.node;
            } else {
                return new cc.Node();
            }
        }.bind(this);
        let eventFunction = function (event) {
            if (event == 'finish') {
                this._isAnimFinish = true;
                this._textGetDetail.node.active = (true);
                this._textGetDetail.string = (Lang.get('recruit_get_detail', {
                    name: this._heroData.name,
                    count: this._count
                }));
                this._nodeContinue.node.active = (true);
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayMovingGfx(this._heroNode, 'moving_card_open_yes', effectFunction, eventFunction, false);
    }
    _createCard(color) {
        var spriteName = [
            Path.getDrawCard('blue_card'),
            Path.getDrawCard('green_card'),
            Path.getDrawCard('blue_card'),
            Path.getDrawCard('purple_card'),
            Path.getDrawCard('god_card'),
            Path.getDrawCard('red_card')
        ];
        var sprite = UIHelper.newSprite(spriteName[color - 1]);
        return sprite.node;
    }
    _onImageBGTouch() {
        if (this._isAnimFinish) {
            G_SceneManager.popScene();
        }
    }
}