const {ccclass, property} = cc._decorator;
import DrawCardResourceInfo from "./DrawCardResourceInfo";
import { Lang } from "../../../lang/Lang";
@ccclass
export default class DrawCardCashTenCell extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBook: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnDraw: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFree: cc.Label = null;

    @property({
        type: DrawCardResourceInfo,
        visible: true
    })
    _resource: DrawCardResourceInfo = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: false
    })
    _textBanshuCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: false
    })
    _textGold: cc.Label = null;
    _touchFunc: any;

    addTouchFunc(func: Function) {
        this._touchFunc = func;
    }
    onDrawCardClick() {
        if (this._touchFunc) {
            this._touchFunc();
        }
    }
    setRedPointVisible(v: boolean) {
        this._redPoint.node.active = v;
    }
    setFreeVisible(v: boolean) {
        this._textFree.node.active = v;
    }
    setResourceVisible(v: boolean) {
        this._resource.node.active = v;
    }
    updateResourceInfo(type: any, value: any, size: any) {
        this._resource.updateUI(type, value, size);
    }
    setTextCountDown(str: string) {
        if (!str) {
            this._textCountDown.node.active = false
            return;
        }
        this._textCountDown.node.active = (true);
        this._textCountDown.string = str;
    }
    refreshBanshuInfo(count1: any, count2: any, count3: any) {
        this._textGold.string = (Lang.get('recruit_banshu_gold', {
            count: count1,
            countcount: count3
        }));
        this._textBanshuCount.string = (Lang.get('recruit_left_count', { count: count2 }));
        this._textGold.node.active = (true);
        this._textBanshuCount.node.active = (true);
    }
    setBanshuVisible(vis: boolean) {
        this._textGold.node.active = (vis);
        this._textBanshuCount.node.active = (vis);
    }
}