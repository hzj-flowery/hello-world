import CommonIconBase from "./CommonIconBase";
import { Lang } from "../../lang/Lang";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonDefaultIcon extends CommonIconBase {

    constructor() {
        super();
        this._type = TypeConvertHelper.TYPE_RESOURCE;
    }

    updateUI(value, size) {

    }

    getItemParams() {
        var itemParams: any = {}
        itemParams.name = Lang.get("default_icon")
        itemParams.icon_color = 2
        itemParams.icon_color_outline = 2
        return itemParams
    }
}