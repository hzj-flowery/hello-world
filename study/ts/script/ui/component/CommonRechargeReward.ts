import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Lang } from "../../lang/Lang";
import { RichTextExtend } from "../../extends/RichTextExtend";
import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonRechargeReward extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_Content: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_Text: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Icon: cc.Sprite = null;


    updateUI(type, value, money, count) {
        var resParam = TypeConvertHelper.convert(type, value);
        var content = Lang.get('common_recharge_rewards', {
            money: money,
            count: count
        });
        var richText = RichTextExtend.createWithContent(content);
        richText.node.setAnchorPoint(cc.v2(0, 0));
        this._node_Text.addChild(richText.node);
        UIHelper.loadTexture(this._image_Icon, resParam.res_mini);
    }

}
