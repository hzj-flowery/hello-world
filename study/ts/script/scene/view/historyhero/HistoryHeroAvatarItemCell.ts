import { FunctionConst } from "../../../const/FunctionConst";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { G_EffectGfxMgr } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import CommonHistoryAvatar from "../../../ui/component/CommonHistoryAvatar";
import CommonHistoryHeroName from "../../../ui/component/CommonHistoryHeroName";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroAvatarItemCell extends cc.Component {
    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;
    @property({ type: CommonHistoryAvatar, visible: true })
    _avatar: CommonHistoryAvatar = null;
    @property({ type: CommonHistoryHeroName, visible: true })
    _heroName: CommonHistoryHeroName = null;
    @property({ type: cc.Sprite, visible: true })
    _panelDesign: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageAdd: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _textAdd: cc.Label = null;
    @property({ type: CommonButtonLevel2Highlight, visible: true })
    _buttonReplace: CommonButtonLevel2Highlight = null;
    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeLock: cc.Node = null;
    @property({ type: cc.Label, visible: true })
    _labelOpenLevel: cc.Label = null;
    @property({ type: cc.Sprite, visible: true })
    _redPointReplace: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _redPointAdd: cc.Sprite = null;

    _touchCallBackData: any = {};

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._imageAdd.node.active = (false);
        this._textAdd.string = (Lang.get('historyhero_add_formation'));
        this._buttonReplace.setString(Lang.get('historyhero_replace'));
        this._buttonReplace.addClickEventListenerEx(handler(this, this._onReplaceTouch));
    }
    _playHeroPickAnimation(rootNode, data) {
        function effectFunction(effect) {
            var node = new cc.Node();
            if (effect == 'effect_zm_boom') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_zm_boom');
                subEffect.play();
            }
            return node;
        }
        function eventFunction(event) {
            if (event == 'finish') {
            } else if (event == 'hero') {
                this._avatar.setVisible(true);
                this._avatar.updateUI(data.cfg.getSystem_id());
                this._avatar.setScale(1.5);
                var params = this._avatar.getItemParams();
                this._heroName.setName(params.name);
                this._heroName.setColor(params.icon_color);
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_wuchabiebuzhen_wujiang', effectFunction, eventFunction, false);
    }
    _onSelectTouch(sender, state) {
        if (this._nodeLock.active) return;
        this._touchCallBackData.isReplace = true;
        this.dispatchCustomCallback(this._touchCallBackData);
    }
    _onReplaceTouch(sender, state) {
        this._touchCallBackData.isReplace = true;
        this.dispatchCustomCallback(this._touchCallBackData);
    }
    updateNameVisible(bVisible) {
        this._buttonReplace.setVisible(false);
        this._buttonReplace.setEnabled(false);
    }
    UpdateOpcacity(bEquiped) {
        this._avatar.updateOpcacity(bEquiped && 0.4 || 1);
    }
    getCurCellData() {
        return this._touchCallBackData;
    }
    updateUI(data) {
        if (data == null) {
            return;
        }
        if (data.cfg == null) {
            this._touchCallBackData.id = null;
            this._touchCallBackData.index = data.index;
            this._touchCallBackData.state = 2;
            this._touchCallBackData.heroId = 0;
            this._touchCallBackData.breakthrough = 0;
            this._heroName.setVisible(false);
            this._avatar.setVisible(false);
            this._panelTouch.active = (false);
            if (data.isLock) {
                this._nodeLock.active = (true);
                this._labelOpenLevel.string = (Lang.get('historyhero_unlock_level2', { level: data.unlockLevel }));
                this._imageAdd.node.active = (false);
            } else {
                this._nodeLock.active = (false);
                this._imageAdd.node.active = (true);
                UIHelper.addEventListenerToNode(this.node, this._imageAdd.node, 'HistoryHeroAvatarItemCell', '_onSelectTouch');
                this._buttonReplace.setVisible(false);
                this._buttonReplace.setEnabled(false);
            }
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'space');
            this._redPointAdd.node.active = (reach);
            this._redPointReplace.node.active = (false);
        } else {
            this._imageAdd.node.active = (false);
            this._buttonReplace.setVisible(true);
            this._buttonReplace.setEnabled(true);
            this._touchCallBackData.id = data.cfg.getId();
            this._touchCallBackData.index = data.index;
            this._touchCallBackData.state = 1;
            this._touchCallBackData.heroId = data.cfg.getSystem_id();
            this._touchCallBackData.breakthrough = data.cfg.getBreak_through();
            this._nodeLock.active = (false);
            this._avatar.setVisible(true);
            this._avatar.updateUI(data.cfg.getSystem_id());
            this._avatar.setScale(1.6);
            var params = this._avatar.getItemParams();
            this._heroName.setName(params.name);
            this._heroName.setColor(params.icon_color);
            this.updateNameVisible(data.isGallery);
            this._panelTouch.active = (true);
            UIHelper.addEventListenerToNode(this.node, this._panelTouch, 'HistoryHeroAvatarItemCell', '_onSelectTouch');
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'strongerThanMe', data.cfg);
            this._redPointReplace.node.active = (reach);
            this._redPointAdd.node.active = (false);
        }
    }
}