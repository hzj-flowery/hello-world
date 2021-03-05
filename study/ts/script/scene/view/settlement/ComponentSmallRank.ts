import { G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ComponentBase from "./ComponentBase";
import PanelSmallRank from "./PanelSmallRank";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentSmallRank extends ComponentBase {

    private _strRankName;
    private _oldRank;
    private _newRank;
    private _imageRes;
    _defaultString: any;
    _panel: PanelSmallRank;

    public init(position, strRankName, oldRank, newRank, imageRes?, defaultString?) {
        this.node.setPosition(position);
        this._strRankName = strRankName;
        this._oldRank = oldRank;
        this._newRank = newRank;
        this._imageRes = imageRes;
        this._defaultString = defaultString;
        this._panel = null;
        super.init();
    }
    start() {
        super.setStart();
        this._playAnim();
    }

    public createRankPanel() {
        let panel: cc.Node = new cc.Node();
        cc.resources.load(Path.getPrefab('PanelSmallRank', 'settlement'), cc.Prefab, function (err, res: any) {
            if (err != null || res == null || !panel.isValid) {
                return;
            }
            let panelSmallRank: PanelSmallRank = cc.instantiate(res).getComponent(PanelSmallRank);
            this._panel = panelSmallRank;
            panel.addChild(panelSmallRank.node);
            panelSmallRank.updateUI(this._strRankName, this._oldRank, this._newRank, this._imageRes, this._defaultString);
        }.bind(this));
        return panel;
    }
    setRankOldString(string) {
        this._panel.setString(string);
    }

    _playAnim() {
        function effectFunction(effect) {
            if (effect == 'win_exp') {
                return this.createRankPanel();
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_exp', effectFunction.bind(this), handler(this, this.checkEnd), false);
    }
}