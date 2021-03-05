const {ccclass, property} = cc._decorator;
import CommonUI from "../../../ui/component/CommonUI";
import { Path } from "../../../utils/Path";

import ViewBase from "../../ViewBase";
@ccclass
export default class GrainCarArrow extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _arrow: cc.Sprite = null;

    private _isMyGuild:boolean;
    private _percent:number;
    ctor(isMyGuild) {
        this._isMyGuild = isMyGuild;
        this.name = ('GrainCarArrow');
    }
    onCreate() {
    }
    onEnter() {
        if (this._isMyGuild) {
            this._arrow.node.addComponent(CommonUI).loadTexture(Path.getMineImage('img_route_02'));
        }
    }
    onExit() {
    }
    onShowFinish() {
    }
    setPercent(percent) {
        this._percent = percent;
    }
    getPercent() {
        return this._percent;
    }
};