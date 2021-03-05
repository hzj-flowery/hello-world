const { ccclass, property } = cc._decorator;

import { Colors, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import PopupTowerChoose from './PopupTowerChoose';

@ccclass
export default class TowerAvatarNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;
    @property({ type: CommonHeroAvatar, visible: true })
    _panelAvatar: CommonHeroAvatar = null;
    @property({ type: cc.Node, visible: true })
    _nodeInfo: cc.Node = null;
    @property({ type: cc.Label, visible: true })
    _stageName: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    _nodeSword: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _starPanel3: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _starPanel2: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _starPanel1: cc.Node = null;

    private static STAR_DELAY = 0.3
    private static STAR_SCALE = 0.7

    private _layerConfig;
    private _layerData;
    private _nextLayer;
    private _nowLayer;
    private _starEftCount;
    private _starEftFinish;
    private _starEffect: cc.Node[];
    private _starPanel: cc.Node[];

    public init(index) {
        this._layerConfig = null;
        this._layerData = null;
        this._nextLayer = null;
        this._nowLayer = 0;
        this._starEftCount = 0;
        this._starEftFinish = 0;
        this._starEffect = [];

        this._starPanel = [
            this._starPanel1,
            this._starPanel2,
            this._starPanel3
        ];

        this.node.name = "TowerAvatarNode" + (index + 1);
        this._panelTouch.on(cc.Node.EventType.TOUCH_START, handler(this, this._onAvatarClick));
    }

    public refresh(layerData, layerConfig, nextLayer) {
        this._layerConfig = layerConfig;
        this._layerData = layerData;
        this._nextLayer = nextLayer;
        this._nowLayer = G_UserData.getTowerData().getNow_layer();
        this._stageName.string = (this._layerConfig.name);
        this._stageName.node.color = (Colors.getColor(this._layerConfig.color));
        UIHelper.enableOutline(this._stageName, Colors.getColorOutline(this._layerConfig.color), 1);
        this._panelAvatar.updateUI(this._layerConfig.res_id);
        this._panelAvatar.setTouchEnabled(false);
        this._panelAvatar.turnBack();
        var height = this._panelAvatar.getHeight();
        this._nodeInfo.y = (height);
        var layerId = this._layerConfig.id;
        if (layerId <= this._nowLayer) {
            this.showSword(false);
            this.showBubble(false);
        } else if (layerId == this._nextLayer) {
            this.showSword(true);
            this.showBubble(true);
        } else {
            this.showSword(false);
            this.showBubble(false);
        }
        this._refreshStar();
    }

    private _refreshStar() {
        if (this._layerConfig.id == this._nowLayer && G_UserData.getTowerData().isShowStarEft()) {
            this._setStarCount(0);
            this._playStarEft();
            G_UserData.getTowerData().setShowStarEft(false);
            return;
        }
        var star = 0;
        if (this._layerData) {
            star = this._layerData.getNow_star();
        }
        this._setStarCount(star);
    }

    private _setStarCount(count) {
        this._clearStarEffect();
        for (let i in this._starPanel) {
            var v = this._starPanel[i];
            var starNode = v.getChildByName('Star');
            starNode.active = (false);
            if (i < count) {
                starNode.active = (true);
            }
        }
    }

    private _clearStarEffect() {
        for (let i in this._starEffect) {
            var v = this._starEffect[i];
            v.destroy();
        }
        this._starEffect = [];
    }

    public showSword(s) {
        this._nodeSword.removeAllChildren();
        if (s) {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeSword, 'moving_shuangjian', null, null, false);
        }
    }

    public showBubble(s) {
        if (s) {
            this._panelAvatar.setBubble(this._layerConfig.talk, null, 2);
        } else {
            this._panelAvatar.setBubbleVisible(false);
        }
    }

    public _onAvatarClick() {
        var layerId = this._layerConfig.id;
        if (layerId == this._nextLayer) {
            if (this._nextLayer == this._nowLayer) {
                G_Prompt.showTip(Lang.get('challenge_tower_already'));
            } else {
                G_SceneManager.openPopup(Path.getPrefab("PopupTowerChoose", "tower"), (popupTowerChoose: PopupTowerChoose) => {
                    popupTowerChoose.init(this._layerConfig);
                    popupTowerChoose.openWithAction();
                });
            }
        } else if (layerId > this._nextLayer) {
            G_Prompt.showTip(Lang.get('challenge_tower_not_reach'));
        } else if (layerId < this._nextLayer) {
            G_Prompt.showTip(Lang.get('challenge_tower_already'));
        }
    }

    private _playStarEft() {
        var star = this._layerData.getNow_star();
        this._starEftCount = star;
        this._starEftFinish = 0;
        for (let i = 0; i < star; i++) {
            var starPanel = this._starPanel[i];
            var delayTime = TowerAvatarNode.STAR_DELAY * (i);
            this._playSingleStarEft(starPanel, delayTime);
        }
    }

    private _playSingleStarEft(node, delayTimme) {
        function eventFunction(event) {
            if (event == 'finish') {
                this._starEftFinish = this._starEftFinish + 1;
                if (this._starEftFinish >= this._starEftCount) {
                }
            }
        }
        function funcStar() {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_xiaoxingxing', null, eventFunction, false).node;
            var nodeSize = node.getContentSize();
            // var pos = cc.v2(nodeSize.width * 0.5, nodeSize.height * 0.5);
            var pos = cc.v2(0, 0);
            effect.setPosition(pos);
            effect.setScale(TowerAvatarNode.STAR_SCALE);
            this._starEffect.push(effect);
        }
        var action1 = cc.delayTime(delayTimme);
        var action2 = cc.callFunc(funcStar.bind(this));
        var action = cc.sequence(action1, action2);
        node.runAction(action);
    }
}