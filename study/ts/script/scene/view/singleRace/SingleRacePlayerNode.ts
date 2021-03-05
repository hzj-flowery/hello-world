import { ComponentIconHelper } from "../../../ui/component/ComponentIconHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { handler } from "../../../utils/handler";
import { SingleRaceConst } from "../../../const/SingleRaceConst";
import { Colors, G_EffectGfxMgr } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

var COLOR_ELIMINATE = cc.color(127, 127, 127);
@ccclass
export default class SingleRacePlayerNode extends cc.Component {
    _pos: any;
    _callback: any;
    _data: any;
    _isSelf: boolean;
    _imageBg: any;
    _nodeEffect: any;
    _textServer: any;
    _textName: any;
    _nodeIcon: CommonHeroIcon;
    ctor(pos, callback, heroIconPrefab:cc.Prefab) {
        this._pos = pos;
        this._callback = callback;
        this._data = null;
        this._isSelf = false;
        var imgNode = this.node.getChildByName('ImageBg')
        if (imgNode) {
            this._imageBg = imgNode.getComponent(cc.Sprite);
            this._nodeEffect = this._imageBg.node.getChildByName('NodeEffect');
        }
        this._textServer = this.node.getChildByName('TextServer').getComponent(cc.Label);
        this._textName = this.node.getChildByName('TextName').getComponent(cc.Label);
        var nodeIcon = this.node.getChildByName('NodeIcon');
        this._nodeIcon = cc.instantiate(heroIconPrefab).getComponent(CommonHeroIcon);
        this._nodeIcon.node.setScale(nodeIcon.scaleX);
        this._nodeIcon.node.setPosition(nodeIcon.getPosition());
        nodeIcon.removeFromParent();
        this.node.addChild(this._nodeIcon.node);
        this._nodeIcon.setTouchEnabled(true);
        this._nodeIcon.setCallBack(handler(this, this._onClickIcon));
    }
    updateUI(data, state) {
        this._data = data;
        if (data) {
            this._textServer.node.active = (true);
            this._textName.node.active = (true);
            this._nodeIcon.showHeroUnknow(false);
            var serverName = data.getServer_name();
            var userName = data.getUser_name();
            var officerLevel = data.getOfficer_level();
            var [covertId, limitLevel, limitRedLevel] = data.getCovertIdAndLimitLevel();
            this._textServer.string = (serverName);
            this._textName.string = (userName);
            this._nodeIcon.updateUI(covertId, null, limitLevel, limitRedLevel);
            if (state == SingleRaceConst.RESULT_STATE_LOSE) {
                this._textServer.node.color = (COLOR_ELIMINATE);
                this._textName.node.color = (COLOR_ELIMINATE);
                this._nodeIcon.setIconMask(true);
            } else {
                this._textServer.node.color = (Colors.BRIGHT_BG_TWO);
                this._textName.node.color = (Colors.getOfficialColor(officerLevel));
                this._nodeIcon.setIconMask(false);
            }
        } else {
            this._textServer.node.active = (false);
            this._textName.node.active = (false);
            this._nodeIcon.showHeroUnknow(true);
            this._nodeIcon.setIconMask(false);
        }
    }
    fontSizeBigger() {
        this._textServer.fontSize = (30);
        this._textName.fontSize = (30);
    }
    fontSizeSmaller() {
        this._textServer.fontSize = (20);
        this._textName.fontSize = (20);
    }
    showEffect(effectName) {
        this._nodeIcon.showLightEffect(null, effectName);
    }
    removeEffect() {
        this._nodeIcon.removeLightEffect();
    }
    setSelfModule(isSelf) {
        this._isSelf = isSelf;
        if (this._nodeEffect == null) {
            return;
        }
        this._nodeEffect.removeAllChildren();
        if (isSelf) {
            UIHelper.loadTexture(this._imageBg, Path.getIndividualCompetitiveImg('img_individual-competitive_02b'));
            G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_liuxian_orange', null, false);
        } else {
            UIHelper.loadTexture(this._imageBg, Path.getIndividualCompetitiveImg('img_individual-competitive_02'));
        }
    }
    _onClickIcon(sender) {
        if (this._callback && this._data) {
            var userId = this._data.getUser_id();
            var power = this._data.getPower();
            this._callback(userId, this._pos, power);
        }
    }
}