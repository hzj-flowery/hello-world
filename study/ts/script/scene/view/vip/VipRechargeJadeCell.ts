import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";
import { RichTextHelper } from "../../../utils/RichTextHelper";
import VipItemInfo from "./VipItemInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VipRechargeJadeCell extends ListViewCellBase {

    @property({
        type:cc.Node,
        visible:true
    })
    Node_effect:cc.Node = null;

    @property(VipItemInfo)
    ItemInfo:VipItemInfo = null;
}
