import ViewBase from "../../ViewBase";
const { ccclass, property } = cc._decorator;
@ccclass
export default class GuildMainSceneBg extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _scrollBG: cc.Sprite = null;

    onCreate() {
    }
    onEnter() {

    }
    onExit() {

    }

}