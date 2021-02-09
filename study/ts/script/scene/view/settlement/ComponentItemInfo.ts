import { G_EffectGfxMgr } from "../../../init";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ComponentBase from "./ComponentBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentItemInfo extends ComponentBase {

    private _item;
    private _critIndex;
    private _critValue;

    public init(item, position, critIndex?, critValue?) {
        this.node.setPosition(position);
        this._item = item;
        this._critIndex = critIndex;
        this._critValue = critValue;
        super.init();
    }

    public updateCrit(critIndex, critValue) {
        this._critIndex = critIndex;
        this._critValue = critValue;
    }

    public setStart() {
        super.setStart();
        this._playAnim();
    }

    private _playAnim() {

        var node = new cc.Node("resInfo");

        cc.resources.load(Path.getPrefab('CommonResourceInfo', 'common'), cc.Prefab, (err, res)=> {
            if (err != null || res == null || !node.isValid) {
                return;
            }
            let resInfo:CommonResourceInfo = cc.instantiate(res).getComponent(CommonResourceInfo);
            node.addChild(resInfo.node);
            resInfo.onLoad();
            resInfo.updateUI(this._item.type, this._item.value, this._item.size);
            resInfo.setTextColorToDTypeColor();
            resInfo.showResName(true);
            if (this._critIndex != null) {
                resInfo.updateCrit(this._critIndex, this._critValue);
            }
        });
        function effectFunction(effect) {
            if (effect == 'win_exp') {
                return node;
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_exp', effectFunction, handler(this, this.checkEnd), false);
    }
}