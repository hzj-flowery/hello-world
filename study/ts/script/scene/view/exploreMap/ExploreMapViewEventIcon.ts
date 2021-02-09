
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader, G_EffectGfxMgr } from "../../../init";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExploreMapViewEventIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconImage: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _textImage: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _tipsNum: cc.Label = null;

    private _type;
    private _onClickCallback;

    @property({
        type: cc.Label,
        visible: true
    })
    _leftTimeLabel: cc.Label = null;

    setUp(eventType, onClickCallback): void {

        this.node.name = "ExploreMapViewEventIcon" + eventType;
        this._type = eventType;
        this._onClickCallback = onClickCallback;

        // this.node.setCascadeOpacityEnabled(true);
        var discoverData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(this._type);
        var textImg = Path.getExploreTextImage('txt_' + discoverData.res_id2);
        var iconImg = Path.getExploreIconImage(discoverData.res_id2 + '_icon');

        this._textImage.spriteFrame = cc.resources.get(textImg, cc.SpriteFrame);
        this._iconImage.spriteFrame = cc.resources.get(iconImg, cc.SpriteFrame);
        this._tipsNum.string = '0';
        if (discoverData.time && discoverData.time > 0) {
            this._leftTimeLabel.node.active = true;
            this._leftTimeLabel.string = '';
        } else {
            this._leftTimeLabel.node.active = false;
        }
        this._iconImage.node.pauseSystemEvents(true);
        this._iconImage.node.on(cc.Node.EventType.TOUCH_END, this._onClickBtn, this);
    }

    //触发奇遇动画
    runAppearAction(callback) {
        this.node.active = true;
        this.node.setScale(0.2);
        var scaleToAction1 = cc.scaleTo(0.2, 1.1);
        var scaleToAction2 = cc.scaleTo(0.15, 1);
        this.node.opacity = 225;
        var callFuncAction1 = cc.callFunc(() => {
            G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_youli_baozha', (effect: string) => {
                return null;
            }, null, true);
        });
        var callFuncAction2 = cc.callFunc(() => {
            this.node.setScale(1);
            this.runCountChangeAction();
            callback && callback();
        });
        var seqAction = cc.sequence(scaleToAction1, callFuncAction1, scaleToAction2, callFuncAction2);
        this.node.runAction(seqAction);
    }
    // 打开界面动画
    runOnEnterAction(callback) {
        this.node.opacity = 0;
        var fadeInAction = cc.fadeIn(0.3);
        var curPos = this.node.getPosition().clone();
        this.node.setPosition(curPos.x + 100, curPos.y + 60);
        var jumpTo = cc.jumpTo(0.3, curPos, 60, 1);
        this.node.setScale(0.1);
        var scaleAction1 = cc.scaleTo(0.4, 0.4);
        var appearAction = cc.spawn(jumpTo, scaleAction1, fadeInAction);
        var scaleAction2 = cc.scaleTo(0.4, 1);
        var callFuncAction = cc.callFunc(() => {
            this.node.opacity = 255;
            this.node.setScale(1);
            this.runCountChangeAction();
            if (callback) callback();
        });
        var seqAction = cc.sequence(appearAction, scaleAction2, callFuncAction);
        this.node.runAction(seqAction);
    }
    //消失动画
    runDisAppearAction(callback) {
        this.node.setScale(1);
        var scaleAction1 = cc.scaleTo(0.2, 0.4);
        this.node.opacity = 255;
        var fadeOutAction = cc.fadeOut(0.3);
        var curPos = this.node.position.clone();
        // var jumpTo = cc.jumpTo(0.3, curPos.x + 100, curPos.y + 50, 60, 1);
        var jumpTo = cc.jumpTo(0.3, curPos.x, curPos.y + 50, 60, 1);
        var scaleAction2 = cc.scaleTo(0.4, 0.1);
        var disAppearAction = cc.spawn(jumpTo, scaleAction2, fadeOutAction);
        var callFuncAction = cc.callFunc(() => {
            // this.node.opacity = 255;
            // this.node.setScale(1);
            callback && callback();
            // this.node.active = false;
        });
        var seqAction = cc.sequence(scaleAction1, disAppearAction, callFuncAction);
        this.node.runAction(seqAction);
    }
    // 移动
    runMoveAction(targetPos, callback) {
        var curPos = this.node.getPosition();
        if (!this.node.active || (targetPos.x == curPos.x && targetPos.y == curPos.y)) {
            if (callback) callback();
            return;
        }
        var offset = -20;
        if (targetPos.y - curPos.y > 0) {
            offset = 20;
        }
        var moveToAction1 = cc.moveTo(0.2, cc.v2(targetPos.x, targetPos.y + offset));
        var moveToAction2 = cc.moveTo(0.15, targetPos);
        var callFuncAction = cc.callFunc(() => {
            if (callback) callback();
        });
        var seqAction = cc.sequence(moveToAction1, moveToAction2, callFuncAction);
        this.node.runAction(seqAction);
    }
    updateLeftTime(timeStr) {
        this._leftTimeLabel.string = timeStr || '';
    }
    setCount(count: number) {
        this._tipsNum.string = count.toString();
    }
    runCountChangeAction(count = null) {
        this._tipsNum.node.stopAllActions();
        var action1 = cc.scaleTo(0.2, 1.5);
        var action2 = cc.scaleTo(0.2, 1);
        var seqAction;
        if (count) {
            var callFuncAction = cc.callFunc(() => {
                this._tipsNum.string = '' + count;
            });
            seqAction = cc.sequence(action1, callFuncAction, action2);
        } else {
            seqAction = cc.sequence(action1, action2);
        }
        this._tipsNum.node.runAction(seqAction);
    }
    _onClickBtn() {
        if (this._onClickCallback) {
            this._onClickCallback(this._type);
        }
    }

}