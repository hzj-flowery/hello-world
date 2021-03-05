import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { HistoryHeroDataHelper } from "../../../utils/data/HistoryHeroDataHelper";
import { stringUtil } from "../../../utils/StringUtil";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import HistoryWeaponDetailHeroNode from "./HistoryWeaponDetailHeroNode";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryWeaponDetailHeroModule extends CommonDetailDynamicModule {

    @property(cc.Prefab)
    detailTitleWithBg: cc.Prefab = null;
    @property(cc.Prefab)
    heroNode: cc.Prefab = null;
    private _weaponData: any;


    ctor(weaponData) {
        this._weaponData = weaponData;
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var des = this._createHeros();
        this._listView.pushBackCustomItem(des);
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var node = cc.instantiate(this.detailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('historyhero_weapon_detail_title_skill'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 50);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, 30);
        widget.addChild(title.node);
        return widget;
    }
    _createHeros() {
        var heros = this._weaponData.getConfig().historical_hero;
        var herosList = stringUtil.split(heros.toString(), '|');
        var HEIGHT_CELL = 110;
        var widget = new cc.Node();
        for (var k in herosList) {
            var v = herosList[k];
            var heroConfig = HistoryHeroDataHelper.getHistoryHeroInfo(Number(v));
            var type = TypeConvertHelper.TYPE_HISTORY_HERO;
            var baseId = Number(v);
            var size = 1;
            var param = TypeConvertHelper.convert(type, baseId, size);

            var heroIcon = cc.instantiate(this.heroNode).getComponent(HistoryWeaponDetailHeroNode);
            heroIcon.updateIcon(heroConfig, baseId, param);
            widget.addChild(heroIcon.node);
            heroIcon.node.setPosition(cc.v2(0, (herosList.length -1 - Number(k)) * HEIGHT_CELL));
        }
        var s = cc.size(402, herosList.length * HEIGHT_CELL + 10);
        widget.setContentSize(s);
        return widget;
    }


}