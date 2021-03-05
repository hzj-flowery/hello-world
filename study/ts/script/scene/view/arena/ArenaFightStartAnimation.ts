import { AudioConst } from "../../../const/AudioConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr } from "../../../init";
import PopupBase from "../../../ui/PopupBase";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ArenaFightStartName from "./ArenaFightStartName";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArenaFightStartAnimation extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRoot: cc.Node = null;
    private _battleData: any;
    private _closeCall: any;
    private _arenaFightStartName:any;

    protected preloadResList = [
        {path:Path.getPrefab("ArenaFightStartName","arena"),type:cc.Prefab}
    ];
    public setInitData(battleData, closeCall) {
        this._battleData = battleData;
        this._closeCall = closeCall;
        this.setNotCreateShade(true);
    }
    onCreate() {
        this._arenaFightStartName = cc.resources.get(Path.getPrefab("ArenaFightStartName","arena"));
    }
    play() {
        this._createEffectNode(this._panelRoot);
    }
    onEnter() {
        this.play();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_ARENA_FIGHT);
    }
    onExit() {
    }
    _createActionNode(effect):cc.Node {
        var getFirstEffect = function (playerIndex) {
            if (this._battleData.firstOrder == playerIndex) {
                let node = new cc.Node();
                G_EffectGfxMgr.createPlayGfx(node,'effect_xianshou_xianshou');
                return node;
            }
            return new cc.Node();
        }.bind(this)
        var getArenaRole = function (playerIndex) {
            var path = null;
            if (playerIndex == 1) {
                var heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(this._battleData.attackBaseId);
              //assert((heroInfo, 'can not find hero base id');
                path = Path.getArenaUI('hero' + heroInfo.gender);
            }
            if (playerIndex == 2) {
                var heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(this._battleData.defenseBaseId);
              //assert((heroInfo, 'can not find hero base id');
                path = Path.getArenaUI('hero' + heroInfo.gender);
            }
            return path;
        }.bind(this)
        var getPower = function (playerIndex) {
            if (playerIndex == 1) {
                var node = (cc.instantiate(this._arenaFightStartName) as cc.Node).getComponent(ArenaFightStartName);
                node.updateUI(this._battleData.attackName, this._battleData.attackOffLevel, this._battleData.attackPower);
                return node.node;
            }
            if (playerIndex == 2) {
                var node = (cc.instantiate(this._arenaFightStartName) as cc.Node).getComponent(ArenaFightStartName);
                node.updateUI(this._battleData.defenseName, this._battleData.defenseOffLevel, this._battleData.defensePower);
                return node.node;
            }
        }.bind(this)
        if (effect == 'xianshou_1') {
            var subEffect = getFirstEffect(1);
            return subEffect;
        } else if (effect == 'xianshou_2') {
            var subEffect = getFirstEffect(2);
            return subEffect;
        } else if (effect == 'role_1') {
            var sprite = UIHelper.newSprite(getArenaRole(1));
            return sprite.node;
        } else if (effect == 'role_2') {
            var sprite = UIHelper.newSprite(getArenaRole(2));
            return sprite.node;
        } else if (effect == 'power_1') {
            return getPower(1);
        } else if (effect == 'power_2') {
            return getPower(2);
        }
    }
    _createEffectNode(rootNode) {
        var effectFunction = function (effect) {
            return this._createActionNode(effect);
        }.bind(this)
        var eventFunction = function (event, frameIndex, movingNode) {
            if (event == 'finish') {
                if (this._closeCall) {
                    this._closeCall();
                }
            }
        }.bind(this)
        var node = G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_xianshou', effectFunction, eventFunction, false);
        return node;
    }
}