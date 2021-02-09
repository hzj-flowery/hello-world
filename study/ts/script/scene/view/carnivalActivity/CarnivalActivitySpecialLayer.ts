import ViewBase from "../../ViewBase";
import { G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CarnivalActivitySpecialLayer extends ViewBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _specialInfo: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _specialImg: cc.Sprite = null;
    _specialId: any;

    ctor(special_id) {
        this._specialId = special_id || 0;
    }
    onCreate() {
        let FestivalResConfog = G_ConfigLoader.getConfig(ConfigNameConst.FESTIVAL_RES);
        var config = FestivalResConfog.get(this._specialId);
        if (config == null) {
            return;
        }
        UIHelper.loadTexture(this._specialImg, config.res_id);
    }
    onEnter() {
    }
    onExit() {
    }
}