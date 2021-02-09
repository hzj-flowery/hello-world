import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { Colors } from "../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BillBoardPet extends cc.Component {

    private POS_STAR = {
        1: [cc.v2(0, 0)],
        2: [
            cc.v2(-10, 0),
            cc.v2(10, 0)
        ],
        3: [
            cc.v2(-20, 0),
            cc.v2(0, 0),
            cc.v2(20, 0)
        ],
        4: [
            cc.v2(-30, 0),
            cc.v2(-10, 0),
            cc.v2(10, 0),
            cc.v2(30, 0)
        ],
        5: [
            cc.v2(-40, 0),
            cc.v2(-20, 0),
            cc.v2(0, 0),
            cc.v2(20, 0),
            cc.v2(40, 0)
        ]
    }

    private _labelName: cc.Label;
    private _starNode: cc.Node;

    public init(name, quality, star) {
        this._labelName = UIHelper.createWithTTF(name, Path.getCommonFont(), 22);
        this.node.addChild(this._labelName.node);
        if (star == 0) {
            this._labelName.node.setPosition(0, 0);
        } else {
            this._labelName.node.setPosition(0, 22);
        }
        this._labelName.node.color = (Colors.getColor(quality));
        UIHelper.enableOutline(this._labelName, Colors.getColorOutline(quality), 2)
        this._starNode = new cc.Node();
        this._starNode.setPosition(0, 0);
        this.node.addChild(this._starNode);
        this._createStar(star);
        this.node.active = (false);
    }
    private _createStar(star: number) {
        if (star == 0) {
            return;
        }
        var pos = this.POS_STAR[star];
        for (let i = 0; i < star; i++) {
            var picStar = UIHelper.newSprite(Path.getCommonImage('icon_com_star'));
            this._starNode.addChild(picStar.node);
            picStar.node.setPosition(pos[i]);
        }
    }
}