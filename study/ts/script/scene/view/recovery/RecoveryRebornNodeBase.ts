import ViewBase from "../../ViewBase";
import UIHelper from "../../../utils/UIHelper";
import UIActionHelper from "../../../utils/UIActionHelper";
import { G_AudioManager, G_EffectGfxMgr } from "../../../init";
import { AudioConst } from "../../../const/AudioConst";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RecoveryRebornNodeBase extends cc.Component {

    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _buttonAdd: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _buttonClose: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;

    protected _fileNode;
    protected _index: number;
    protected _onClickAdd;
    protected _onClickDelete;
    protected _initScale;
    protected _initPos;

    public init(index, onClickAdd, onClickDelete) {
        this._index = index;
        this._onClickAdd = onClickAdd;
        this._onClickDelete = onClickDelete;
        this._initScale = this._fileNode.node.scale;
        this._initPos = this._fileNode.node.position;
    }

    protected _initUI() {
        this._fileNode.node.active = false;
        this._textName.node.active = (false);
        this._buttonAdd.active = (false);
        this._buttonClose.active = (false);
    }

    public reset() {

    }

    public onButtonAddClicked() {
        if (this._onClickAdd) {
            this._onClickAdd();
        }
    }

    public onButtonCloseClicked() {
        this.updateInfo(null);
        if (this._onClickDelete) {
            this._onClickDelete(this._index);
        }
    }

    public updateInfo(...args) {

    }


    public playFlyEffect(taget, callback) {

    }

    protected _updateUI(id, param) {
        this._initUI();
        if (id) {
            this._fileNode.node.active = true;
            this._textName.node.active = (true);
            this._buttonClose.active = (true);
            this._textName.string = (param.name);
            this._textName.node.color = (param.icon_color);
            UIHelper.enableOutline(this._textName, param.icon_color_outline, 2);
        } else {
            this._buttonAdd.active = (true);
            UIActionHelper.playBlinkEffect2(this._buttonAdd);
        }
    }

    protected _playFlyEffect1(target: cc.Node, pos, callback) {
        this._textName.node.active = (false);
        this._buttonAdd.active = (false);
        this._buttonClose.active = (false);
        let moveTo = cc.moveBy(0.2, pos);
        let scaleTo = cc.scaleTo(0.2, 0.3);
        let spawn = cc.spawn(moveTo, scaleTo);
        target.runAction(cc.sequence(
            spawn,
            cc.callFunc(function () {
                target.active = (false);
                if (callback) {
                    callback();
                }
            })));
    }

    protected _playFlyEffect2(target: cc.Node, callback) {
        this._textName.node.active = (false);
        this._buttonAdd.active = (false);
        this._buttonClose.active = (false);
        var scaleTo = cc.scaleTo(0.15, 0.5);
        target.runAction(cc.sequence(scaleTo, cc.callFunc(function () {
            target.active = (false);
            this._playMoving(callback);
        }.bind(this))));
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_RECOVERY);
    }

    private _playMoving(callback) {
        function eventFunction(event) {
            if (event == 'finish') {
                if (callback) {
                    callback();
                }
            }
        }
        if (this._nodeEffect) {
            G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_huishou', null, eventFunction, false);
        }
    }
}