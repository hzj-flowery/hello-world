import { G_EffectGfxMgr } from "../../init";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import PopupBase from "../PopupBase";
import PopupNextFunctionPopInfoNode from "./PopupNextFunctionPopInfoNode";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupNextFunction extends PopupBase {

    private _data;
    private _titleImagePath;
    private _commonContinueNode: cc.Node;

    public init(data) {
        this._data = data;
    }

    public onCreate() {
        this._titleImagePath = Path.getNextFunctionOpen('img_newopen_jijiangzi');
        this._createEffectNode();
        this.setClickOtherClose(true);

        this._commonContinueNode = new cc.Node("commonContinueNode");
        this._commonContinueNode.y = -289;
        this._commonContinueNode.active = false;
        this.node.addChild(this._commonContinueNode);
        cc.resources.load(Path.getPrefab('CommonContinueNode', 'common'), cc.Prefab, function (err, res) {
            if (err != null || res == null) {
                return;
            }
            if (this._commonContinueNode && this._commonContinueNode.isValid) {
                this._commonContinueNode.addChild(cc.instantiate(res));
            }
        }.bind(this));

        cc.resources.load(Path.getPrefab('PopupNextFunctionPopInfoNode', 'common'), cc.Prefab, (err, res: cc.Prefab) => {
            if (err != null || res == null) {
                return;
            }
            let nextInfoNode: PopupNextFunctionPopInfoNode = cc.instantiate(res).getComponent(PopupNextFunctionPopInfoNode);
            nextInfoNode.init(this._data);
            nextInfoNode.node.y = -10;
            if (this.node && this.node.isValid) {
                this.node.addChild(nextInfoNode.node,10);
            }
        });
    }

    public _createActionNode(effect): cc.Node {
        if (effect == 'txt') {
            var txtSp = UIHelper.newSprite(this._titleImagePath);
            return txtSp.node;
        } else if (effect == 'all_bg') {
            var bgSp = UIHelper.newSprite(Path.getUICommon('img_board_break03b'));
            return bgSp.node;
        } else if (effect == 'button') {
            this._commonContinueNode.active = (true);
            return new cc.Node();
        } else if (effect == 'txt_meirilibao') {
            return new cc.Node();
        } else if (effect == 'txt_shuoming') {
            return new cc.Node();
        }
    }

    public _createEffectNode() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_choujiang_hude', this._createActionNode.bind(this), null, false);
    }
}