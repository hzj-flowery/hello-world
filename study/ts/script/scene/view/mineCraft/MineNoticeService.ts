import { G_SceneManager, Colors, G_EffectGfxMgr, G_SignalManager, G_TopLevelNode, G_ResolutionManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";

var effectName = {
    [100]: 'effect_gongkeluoyang',
    [101]: 'effect_gongkexuchang',
    [201]: 'effect_gongkechangan',
    [301]: 'effect_gongkeshouchun'
};
export default class MineNoticeService {


    private _signalChangeGuild: any;

    public static BIG_NOTICE_COLOR = 5;

    private _rootNode: cc.Node;
    constructor() {
        this._rootNode = null;
        this._signalChangeGuild = null;
        this._createRootNode();
        this._registerEvents();
    }
    _registerEvents() {
        if (!this._signalChangeGuild) {
            this._signalChangeGuild = G_SignalManager.add(SignalConst.EVENT_MINE_GUILD_BOARD, handler(this, this._onEventMineGuild));
        }
    }
    testBig(){
        this._createBigMineEffect(100);
    }
    testSmall(){
        this._createSmallMineEffect("断天涯");
    }
    _onEventMineGuild(eventName, mineData) {
        var configData = mineData.getConfigData();
        var mineColor = configData.pit_color;
        if (mineColor == MineNoticeService.BIG_NOTICE_COLOR) {
            this._createBigMineEffect(configData.pit_id);
        } else {
            this._createSmallMineEffect(configData.pit_name);
        }
    }
    _createSmallMineEffect(mineName) {
        if (G_SceneManager.getRunningSceneName() == 'mineCraft' && G_SceneManager.getRunningSceneName() != 'fight') {
            this.show();
            var effectFunction = function (effect): cc.Node {
                if (effect == 'gongke_txt') {
                    var fontColor = Colors.getSmallMineGuild();
                    var content = Lang.get('mine_notice_world', { city: mineName });
                    var label = UIHelper.createWithTTF(content, Path.getFontW8(), 52);
                    label.node.color = (fontColor);
                    UIHelper.enableOutline(label,new cc.Color(255, 120, 0), 2);
                    return label.node;
                }
            }
            var eventFunction = function (event) {
                if (event == 'finish') {
                    this.hide();
                }
            }.bind(this)
            G_EffectGfxMgr.createPlayMovingGfx(this._rootNode, 'moving_gongkexiaocheng', effectFunction, eventFunction, true);
        }
    }
    _createBigMineEffect(mineId) {
        if (G_SceneManager.getRunningSceneName() == 'fight') {
            return;
        }
        this.show();
        var eventFunction = function (event) {
            if (event == 'finish') {
                this.hide();
            }
        }.bind(this)
        var effect = G_EffectGfxMgr.createPlayGfx(this._rootNode, effectName[mineId], eventFunction, true);
        effect.play();
    }
    _unRegisterEvents() {
        if (this._signalChangeGuild) {
            this._signalChangeGuild.remove();
            this._signalChangeGuild = null;
        }
    }
    start() {
        this._registerEvents();
    }
    clear() {
        this._unRegisterEvents();
    }
    show() {
        if (this._rootNode != null) {
            this._rootNode.active = (true);
        }
    }
    hide() {
        if (this._rootNode != null) {
            this._rootNode.active = (false);
        }
    }
    _createRootNode() {
        if (this._rootNode == null) {
            this._rootNode = new cc.Node("MineNoticeService");
            var s = G_ResolutionManager.getDesignSize();
            this._rootNode.setContentSize(s[0], s[1]);
            this._rootNode.setAnchorPoint(0.5, 0.5);
            // this._rootNode.setPosition(s[0] / 2, s[1] / 2);
            G_TopLevelNode.addToSubtitleLayer(this._rootNode);
        }
    }

}