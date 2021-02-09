import { TacticsConst } from "../../../const/TacticsConst";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import EffectHelper from "../../../effect/EffectHelper";
import { Colors, G_EffectGfxMgr } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { TacticsDataHelper } from "../../../utils/data/TacticsDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import TacticsView from "./TacticsView";

const { ccclass, property } = cc._decorator;

@ccclass
export class TacticsUnlockModule extends cc.Component {
    private _parentView: TacticsView;
    private _target: cc.Node;
    private _onClickUnlock: any;
    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    }) _nodeTitle: CommonDetailTitleWithBg = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    }) _nodeHero1: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    }) _nodeHero2: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    }) _nodeHero3: CommonHeroIcon = null;
    @property({
        type: cc.Sprite,
        visible: true
    }) _imgBtnBg: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    }) _btnUnlock: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    }) _imgState: cc.Sprite = null;
    private _heroTip1: cc.Label;
    private _heroTip2: cc.Label;
    private _heroTip3: cc.Label;
    private _subEffect: EffectGfxNode;
    private _materials: any[];
    private _effCallback: any;
    ctor(parentView, target, unlockCallback) {
        this._parentView = parentView;
        this._target = target;
        this._onClickUnlock = unlockCallback;
        UIHelper.addClickEventListenerEx(this._btnUnlock, handler(this, this._onButtonUnlockClicked));
        this.init();
    }
    _onHeroClick(node, itemParams) {
        UIPopupHelper.popupItemGuider(function (popupItemGuider: PopupItemGuider) {
            popupItemGuider.setTitle(Lang.get('way_type_get'));
            popupItemGuider.updateUI(TypeConvertHelper.TYPE_HERO, itemParams.cfg.id);
            popupItemGuider.openWithAction();
        })

    }
    init() {
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('tactics_title_unlock'));
        this._heroTip1 = this._createNumText(this._nodeHero1);
        this._heroTip2 = this._createNumText(this._nodeHero2);
        this._heroTip3 = this._createNumText(this._nodeHero3);
        var subEffect = G_EffectGfxMgr.createPlayGfx(this._target, 'effect_zhanfa_jiesuo', null, null, cc.v2(0, -226))
        subEffect.node.active = (false);
        this._subEffect = subEffect;
        this.scheduleOnce(() => {
            this._nodeHero1.setCallBack(handler(this, this._onHeroClick));
            this._nodeHero2.setCallBack(handler(this, this._onHeroClick));
            this._nodeHero3.setCallBack(handler(this, this._onHeroClick));
        }, 0)
    }
    _createNumText(parent) {
        var params = {
            fontSize: 20,
            fontName: Path.getCommonFont(),
            text: '',
            outlineColor: Colors.TacticsBlackColor,
            outlineSize: 2
        };
        var text = UIHelper.createLabel(params);
        parent.node.addChild(text);
        text.setPosition(cc.v2(0, -33));
        return text.getComponent(cc.Label);
    }
    updateInfo(tacticsUnitData) {
        this._effCallback = null;
        var canUnlock = TacticsDataHelper.isCanUnlocked(tacticsUnitData);
        var statePath = TacticsConst.UNLOCK_STATE_YES;
        if (!canUnlock) {
            statePath = TacticsConst.UNLOCK_STATE_NO;
            this._subEffect.node.active = (false);
        } else {
            this._subEffect.node.active = (true);
            this._subEffect.play();
        }
        UIHelper.loadTexture(this._imgState, statePath);
        var materials = TacticsDataHelper.getUnlockedMaterials(tacticsUnitData);
        this._materials = materials;
        var count = 0;
        for (var i = 1; i <= 3; i++) {
            var node = this['_nodeHero' + i] as CommonHeroIcon;
            var textNum = this['_heroTip' + i] as cc.Label;
            var info = materials[i - 1];
            if (info) {
                node.node.active = (true);
                node.updateHeroIcon(info.value, null);
                node.showName(true);
                node.setNameFontSize(27);
                textNum.node.active = (true);
                var num = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, info.value);
                textNum.string = (Lang.get('common_list_count', {
                    count1: num,
                    count2: info.size
                }));
                if (num >= info.size) {
                    var color = Colors.TacticsActiveColor;
                    textNum.node.color = (color);
                    node.setHeroIconMask(false);
                } else {
                    var color = Colors.RED;
                    textNum.node.color = (color);
                    node.setHeroIconMask(true);
                }
                count = count + 1;
            } else {
                node.node.active = (false);
                textNum.node.active = (false);
            }
        }
        var posXMap = {
            [1]: [0],
            [2]: [
                -60,
                60
            ],
            [3]: [
                -100,
                0,
                100
            ]
        };
        var posXList = posXMap[count] || {};
        for (var index = 0; index < posXList.length; index++) {
            var v = posXList[index];
            var node = this['_nodeHero' + (index + 1)];
            node.node.x = (v);
        }
    }
    playEffect(callback) {
        this._effCallback = callback;
        this._playEffect();
    }
    _playEffect() {
        var offsetIndex = {
            [1]: [[
                200,
                100
            ]],
            [2]: [
                [
                    200,
                    100
                ],
                [
                    -200,
                    -100
                ]
            ],
            [3]: [
                [
                    200,
                    100
                ],
                [
                    -200,
                    -100
                ],
                [
                    200,
                    100
                ]
            ]
        };
        var materials = this._materials;
        for (var i in materials) {
            var info = materials[i];
            var index = Number(i) + 1;
            this['_effFly' + index] = 0;
            var node = this['_nodeHero' + index];
            var param = TypeConvertHelper.convert(info.type, info.value);
            var color = param.cfg.color;
            var sp = UIHelper.newSprite(Path.getBackgroundEffect('img_photosphere5'));
            //var emitter = new cc.ParticleSystemQuad('particle/particle_touch.plist');
            var emitter = new cc.Node();
            var particleSystem = emitter.addComponent(cc.ParticleSystem);
            if (emitter) {
                sp.node.addChild(emitter);
                EffectHelper.loadEffectRes('particle/particle_touch.plist', cc.ParticleAsset, function (res) {
                    if (res) {
                        particleSystem.file = res;
                        particleSystem.resetSystem();
                    }
                }.bind(this))
            }
            var selItem = this._parentView.getSelectItem();
            var worldPos = node.node.convertToWorldSpaceAR(cc.v2(0, 0));
            var pos = this._target.convertToNodeSpaceAR(worldPos);
            sp.node.setPosition(pos);
            this._target.addChild(sp.node);
            var startPos = cc.v2(0, 0);
            var endPos = UIHelper.convertSpaceFromNodeToNode(selItem.node, this._target);
            var pointPos1 = cc.v2(startPos.x, startPos.y + offsetIndex[materials.length][i][0]);
            var pointPos2 = cc.v2((startPos.x + endPos.x) / 2, startPos.y + offsetIndex[materials.length][i][1]);
            var bezier = [
                pointPos1,
                pointPos2,
                endPos
            ];
            var action1 = cc.bezierTo(1, bezier);
            //var action2 = new cc.EaseSineIn(action1);
            var self = this;
            sp.node.runAction(cc.sequence(action1.easing(cc.easeSineIn()), cc.callFunc(() => {
                self._effFlyOver(i);
            }), cc.destroySelf()));
        }
    }
    _effFlyOver(index) {
        this['_effFly' + index] = 1;
        if(this._effCallback){
            this._effCallback();
        }
    }
    _onButtonUnlockClicked() {
        if (this._onClickUnlock) {
            this._onClickUnlock();
        }
    }
    setVisible(visible) {
        this._target.active = (visible);
    }
}