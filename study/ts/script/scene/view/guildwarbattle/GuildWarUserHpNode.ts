import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarUserHpNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageProgressBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePercent: cc.Sprite = null;

    public static HP_IMGS = [
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03d',
        'img_war_member03c',
        'img_war_member03b',
        'img_war_member03a'
    ];

    onCreate() {
        // this._imagePercent.ignoreContentAdaptWithSize(true);
    }
    onEnter() {
    }
    onExit() {
    }
    updateInfo(hp, maxHP) {
        var percent = Math.floor(hp * 100 / maxHP);
        if (hp <= 0) {
            this._imagePercent.node.active = (false);
        } else {
            this._imagePercent.node.active = (true);
            this._imagePercent.node.scaleX = (percent * 0.01);
        }
    }

}