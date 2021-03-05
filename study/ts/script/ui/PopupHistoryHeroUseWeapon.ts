

import { RichTextExtend } from "../extends/RichTextExtend";
import { Colors, G_SceneManager, G_UserData } from "../init";
import { Lang } from "../lang/Lang";
import { HistoryHeroDataHelper } from "../utils/data/HistoryHeroDataHelper";
import { handler } from "../utils/handler";
import { Path } from "../utils/Path";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import UIHelper from "../utils/UIHelper";
import CommonButtonLevel0Highlight from "./component/CommonButtonLevel0Highlight";
import CommonHistoryHeroIcon from "./component/CommonHistoryHeroIcon";
import CommonHistoryWeaponIcon from "./component/CommonHistoryWeaponIcon";
import CommonNormalMiniPop from "./component/CommonNormalMiniPop";
import PopupBase from "./PopupBase";
import PopupItemGuider from "./PopupItemGuider";

const { ccclass, property } = cc._decorator;
@ccclass
export class PopupHistoryHeroUseWeapon extends PopupBase {
    @property({ type: CommonNormalMiniPop, visible: true })
    _commonNodeBk: CommonNormalMiniPop = null;
    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnOk: CommonButtonLevel0Highlight = null;
    @property({ type: cc.Label, visible: true })
    _tip: cc.Label = null;
    @property({ type: CommonHistoryHeroIcon, visible: true })
    _heroIcon: CommonHistoryHeroIcon = null;
    @property({ type: cc.Label, visible: true })
    _heroName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _weaponName: cc.Label = null;
    @property({ type: CommonHistoryWeaponIcon, visible: true })
    _weaponIcon: CommonHistoryWeaponIcon = null;
    @property({ type: cc.Node, visible: true })
    _nodeHeroCount: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeWeaponCount: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeHero: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeWeapon: cc.Node = null;

    public static TYPE_NEED_WEAPON = 1;
    public static TYPE_NOT_NEED_WEAPON = 2;
    _callback: any;
    _weaponCount: number;
    _usedHeroData: any;
    _needWeaponType: number;

    ctor(callback?) {
        this._callback = callback;
        this._weaponCount = 0;
        this._usedHeroData = null;
        this._needWeaponType = PopupHistoryHeroUseWeapon.TYPE_NEED_WEAPON;
    }
    onCreate() {
        this._weaponIcon.onLoad();
        this._btnOk.addClickEventListenerEx(handler(this, this._onBtnOk));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnClose));
        this._commonNodeBk.setTitle(Lang.get('historyhero_use_weapon_title'));
        this._btnOk.setString(Lang.get('historyhero_use_weapon_add'));
        this._tip.string = (Lang.get('historyhero_use_weapon_tip'));
        this._tip.node.active = (false);

    }
    updateUI(historyHeroList, type1?, isFake?) {
        var data = historyHeroList[0];
        this._usedHeroData = data;
        var type = TypeConvertHelper.TYPE_HISTORY_HERO;
        var baseId = data.getSystem_id();
        var param = TypeConvertHelper.convert(type, baseId, 1);
        this._heroIcon.updateUIWithUnitData(data, 1);
        this._heroIcon.setRoundType(false);
        this._heroName.string = (param.name);
        this._heroName.node.color = (param.icon_color);
        UIHelper.updateTextOutline(this._heroName, param);
        var heroCount = isFake ? 0 : historyHeroList.length;
        var heroLangKey = isFake && 'historyhero_hero_count2' || 'historyhero_hero_count';
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get(heroLangKey, {
            num1: heroCount,
            num2: 1
        }), {
            defaultColor: Colors.BRIGHT_BG_TWO,
            defaultSize: 20,
            other: { [1]: { fontSize: 20 } }
        });
        richText.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeHeroCount.addChild(richText.node);
        var weaponId = data.getConfig().arm;
        var weaponData = G_UserData.getHistoryHero().getHeroWeaponUnitData(weaponId);
        var weaponConfig = HistoryHeroDataHelper.getHistoryWeaponInfo(weaponId);
        if (weaponData) {
            this._weaponCount = weaponData.getNum();
        } else {
            this._weaponCount = 0;
        }
        this._weaponIcon.updateUI(weaponId, 1);
        this._weaponName.string = (weaponConfig.name);
        this._weaponName.node.color = (param.icon_color);
        var langKey = this._weaponCount == 0 && 'historyhero_hero_count2' || 'historyhero_hero_count';
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get(langKey, {
            num1: this._weaponCount,
            num2: 1
        }), {
            defaultColor: Colors.BRIGHT_BG_TWO,
            defaultSize: 20,
            other: { [1]: { fontSize: 20 } }
        });
        richText.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeWeaponCount.addChild(richText.node);
        if (this._needWeaponType == PopupHistoryHeroUseWeapon.TYPE_NEED_WEAPON && this._weaponCount == 0 || heroCount == 0) {
            this._btnOk.setString(Lang.get('historyhero_use_weapon_ok'));
            this._tip.node.active = (true);
        }
        if (isFake) {
            this._heroIcon.setCallBack(handler(this, this._onBtnHistoryHeroIconNoHero));
        }
        if (this._weaponCount == 0) {
            this._weaponIcon.setCallBack(handler(this, this._onBtnHistoryHeroWeaponIconNoHero));
        }
    }
    setType(type) {
        this._needWeaponType = type;
        if (type == PopupHistoryHeroUseWeapon.TYPE_NOT_NEED_WEAPON) {
            this._nodeHero.x = (-83);
            this._nodeWeapon.active = (false);
            this._tip.node.active = (false);
        }
    }
    _onBtnOk() {
        if (this._needWeaponType == PopupHistoryHeroUseWeapon.TYPE_NEED_WEAPON && this._weaponCount > 0) {
            if (this._callback) {
                this._callback(this._usedHeroData);
                this.close();
            } else {
                this.close();
            }
        } else if (this._needWeaponType == PopupHistoryHeroUseWeapon.TYPE_NOT_NEED_WEAPON) {
            this._callback(this._usedHeroData);
            this.close();
        } else {
            this.close();
        }
    }
    _onBtnClose() {
        this.close();
    }
    _onBtnHistoryHeroIconNoHero() {
        G_SceneManager.openPopup(Path.getPrefab("PopupItemGuider", "common"), (popupItemGuider: PopupItemGuider) => {
            popupItemGuider.setTitle(Lang.get('way_type_get'));
            popupItemGuider.updateUI(TypeConvertHelper.TYPE_HISTORY_HERO, this._usedHeroData.getSystem_id());
            popupItemGuider.openWithAction();
        });

    }
    _onBtnHistoryHeroWeaponIconNoHero() {
        G_SceneManager.openPopup(Path.getPrefab("PopupItemGuider", "common"), (popupItemGuider: PopupItemGuider) => {
            popupItemGuider.setTitle(Lang.get('way_type_get'));
            popupItemGuider.updateUI(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, this._usedHeroData.getConfig().arm);
            popupItemGuider.openWithAction();
        });

    }
}