import { CountryBossConst } from "../../../const/CountryBossConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_Prompt, G_SceneManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { SpineNode } from "../../../ui/node/SpineNode";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { CountryBossHelper } from "./CountryBossHelper";






const { ccclass, property } = cc._decorator;

@ccclass
export default class CountryBossCityUnitNode extends cc.Component {

    @property({
        type: cc.Button,
        visible: true
    })
    _btnGo: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _infoBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _infoText: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nameBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageName: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSword: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFire: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlag: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _rankTopNode: cc.Node = null;
    _cfg: any;
    _data: any;
    _isPlayFirstRankName: any;
    _flagEffect: any;

    ctor(cfg) {
        this._cfg = cfg;
        this.onCreate();
        UIHelper.addEventListener(this.node, this._btnGo, 'CountryBossCityUnitNode', '_onBtnGo');
    }
    onCreate() {
        UIHelper.loadTexture(this._imageName, Path.getCountryBossText(this._cfg.name_pic));
        UIHelper.loadTexture(this._btnGo.node.getComponent(cc.Sprite), Path.getCountryBossImage(this._cfg.city_pic))
        CountryBossHelper.createSwordEft(this._nodeSword);
        CountryBossHelper.createFireEft(this._nodeFire);
        this._createFlag();
        this.stopPlayFirstRankName();
        this.updateUI();
        if (this._cfg.id == 5 || this._cfg.id == 6) {
            this._nodeFire.x = (-25);
        } else if (this._cfg.id == 7 || this._cfg.id == 8) {
            this._nodeFire.x = (-25);
        }
    }
    updateUI() {
        var data = G_UserData.getCountryBoss().getBossDataById(this._cfg.id);
        if (!data) {
            return;
        }
        this._data = data;
        if (CountryBossHelper.getStage() == CountryBossConst.STAGE1) {
            this._nodeSword.active = (true);
        } else {
            this._nodeSword.active = (false);
        }
        this._nodeFlag.active = (false);
        this._infoBg.node.active = (true);
        this._infoText.node.active = (true);
        if (data.isBossDie()) {
            this._nodeFlag.active = (true);
            this._infoText.string = (Lang.get('country_boss_city_boss_die_label'));
            this._nodeSword.active = (false);
            this._nodeFire.active = (true);
            this._infoBg.node.active = (false);
            this._infoText.node.active = (false);
            this.stopPlayFirstRankName();
        } else {
            this._nodeFire.active = (false);
            this._infoText.string = ('%s%').format(Math.floor(data.getNow_hp() * 100 / data.getMax_hp()));
        }
        if (this._isPlayFirstRankName) {
            var firstRank = data.getRankFirst();
            if (firstRank) {
                var rankStr = firstRank.getGuild_name();
                this.setRankTopNodeRichString(rankStr);
            }
        }
    }
    onEnter() {
    }
    onExit() {
    }
    _onBtnGo() {
        var curStage = CountryBossHelper.getStage();
        if (curStage == CountryBossConst.NOTOPEN) {
            G_Prompt.showTip(Lang.get('country_boss_open_tip'));
            return;
        }
        if (curStage != CountryBossConst.STAGE1) {
            var data = G_UserData.getCountryBoss().getBossDataById(this._cfg.id);
            if (!data) {
                return;
            }
            if (data.isBossDie()) {
                G_Prompt.showTip(Lang.get('country_boss_not_stage1_tip1'));
            } else {
                G_Prompt.showTip(Lang.get('country_boss_not_stage1_tip2'));
            }
            return;
        }
        G_SceneManager.showScene('countrybosssmallboss', this._cfg.id);
    }
    _createFlag() {
        this._flagEffect = SpineNode.create();
        this._flagEffect.setAsset(Path.getEffectSpine('sanguozhanjiqizi'));
        this._flagEffect.setAnimation('effect', true);
        this._nodeFlag.addChild(this._flagEffect.node);
        this._nodeFlag.active = (false);
    }
    playFirstRankName() {
        var data = G_UserData.getCountryBoss().getBossDataById(this._cfg.id);
        if (!data) {
            return false;
        }
        if (data.isBossDie()) {
            return false;
        }
        var firstRank = data.getRankFirst();
        if (!firstRank) {
            return false;
        }
        var rankStr = firstRank.getGuild_name();
        this.stopPlayFirstRankName();
        this.setRankTopNodeRichString(rankStr);
        this._isPlayFirstRankName = true;
        this._rankTopNode.opacity = (0);
        this._rankTopNode.active = (true);
        this._rankTopNode.setScale(0.1);
        var fadeIn = cc.fadeIn(0.2);
        var scaleToAction1 = cc.scaleTo(0.2, 1.2);
        var appearAction = cc.spawn(fadeIn, scaleToAction1);
        var scaleToAction2 = cc.scaleTo(0.1, 1);
        var delay = cc.delayTime(3);
        var fadeOut = cc.fadeOut(0.5);
        var scaleToAction3 = cc.scaleTo(0.5, 1);
        var disappearAction = cc.spawn(fadeOut, scaleToAction3);
        var callfuncAction = cc.callFunc(function () {
            this.stopPlayFirstRankName();
        }.bind(this));
        var seq = cc.sequence(appearAction, scaleToAction2, delay, disappearAction, callfuncAction);
        this._rankTopNode.runAction(seq);
        return true;
    }
    stopPlayFirstRankName() {
        if (this._isPlayFirstRankName == true || this._isPlayFirstRankName == null) {
            this._isPlayFirstRankName = false;
            this._rankTopNode.stopAllActions();
            this._rankTopNode.active = (false);
            this._rankTopNode.opacity = (255);
            this._rankTopNode.setScale(1);
        }
    }
    setRankTopNodeRichString(name) {
        this._rankTopNode.removeAllChildren();
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('country_boss_first_rank_rich', { name: name }), {
            defaultColor: Colors.DARK_BG_ONE,
            defaultSize: 20,
            other: { [2]: { outlineColor: Colors.DARK_BG_OUTLINE } }
        });
        this._rankTopNode.addChild(richText.node);
    }

}