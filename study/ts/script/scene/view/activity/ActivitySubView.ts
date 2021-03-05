import ViewBase from "../../ViewBase";
import CommonFullScreenActivityTitle from "../../../ui/component/CommonFullScreenActivityTitle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActivitySubView extends ViewBase {

    @property({
        type: CommonFullScreenActivityTitle,
        visible: true
    })
    _actTitle: CommonFullScreenActivityTitle = null;

    _isInShow:boolean = false;

    enterModule() {
        this._isInShow = true;
    }
    exitModule() {
        this._isInShow = false;
    }
    isInShow() {
        return this._isInShow;
    }
    setTitle(str) {
        this._actTitle.setTitle(str);
    }

    onCreate(){

    }
    onEnter(){

    }
    onExit(){

    }
}
