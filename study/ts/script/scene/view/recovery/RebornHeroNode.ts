import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import UIActionHelper from "../../../utils/UIActionHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RebornHeroNode extends RecoveryRebornNodeBase {

    // @property({ type: CommonHeroAvatar, visible: true })
    // _fileNodeHero: CommonHeroAvatar = null;

    // public init(index, onClickAdd, onClickDelete) {
    //     super.init(index, onClickAdd, onClickDelete);
    //     this._fileNodeHero.init();
    // }

    // protected _initUI() {
    //     this._fileNodeHero.node.active = (false);
    //     super._initUI();
    // }

    // public updateInfo(heroId, limitLevel?) {
    //     this._initUI();
    //     if (heroId) {
    //         this._fileNodeHero.node.active = (true);
    //         this._textName.node.active = (true);
    //         this._buttonClose.active = (true);

    //         this._fileNodeHero.updateUI(heroId, null, null, limitLevel);
    //         var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, null, null, limitLevel);
    //         this._textName.string = (heroParam.name);
    //         this._textName.node.color = (heroParam.icon_color);
    //         UIHelper.enableOutline(this._textName, heroParam.icon_color_outline, 2);
    //     } else {
    //         this._buttonAdd.active = (true);
    //         UIActionHelper.playBlinkEffect2(this._buttonAdd);
    //     }
    // }

    // public reset() {
    //     var heroNode = this._fileNodeHero.getNodeHero();
    //     heroNode.setPosition(0, 0);
    //     heroNode.setScale(1);
    //     heroNode.active = (true);
    // }

    // public playFlyEffect(callback) {
    //     this._textName.node.active = (false);
    //     this._buttonAdd.active = (false);
    //     this._buttonClose.active = (false);
    //     this._fileNodeHero.showShadow(false);
    //     var heroNode = this._fileNodeHero.getNodeHero();
    //     var scaleTo = cc.scaleTo(0.15, 0.5);
    //     heroNode.runAction(cc.sequence(scaleTo, cc.callFunc(function () {
    //         heroNode.active = (false);
    //         this._playMoving(callback);
    //     }.bind(this))));
    //     G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_RECOVERY);
    // }

    // private _playMoving(callback) {
    //     function eventFunction(event) {
    //         if (event == 'finish') {
    //             if (callback) {
    //                 callback();
    //             }
    //         }
    //     }
    //     G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_huishou', null, eventFunction, false);
    // }
}