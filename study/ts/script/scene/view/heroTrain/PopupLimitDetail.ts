import { HeroUnitData } from "../../../data/HeroUnitData";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import PopupBase from "../../../ui/PopupBase";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import HeroLimitDetailTalentNode from "../heroTrain/HeroLimitDetailTalentNode";
import HeroLimitDetailAttrNode from "./HeroLimitDetailAttrNode";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { HeroConst } from "../../../const/HeroConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupLimitDetail extends PopupBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    private _heroUnitData: HeroUnitData;

    private _heroLimitDetailAttrNode: any;
    private _heroLimitDetailTalentNode: any;

    protected preloadResList = [
        { path: Path.getPrefab("HeroLimitDetailAttrNode", "heroTrain"), type: cc.Prefab },
        { path: Path.getPrefab("HeroLimitDetailTalentNode", "heroTrain"), type: cc.Prefab },
    ]
    _limitDataType: any;


    public setInitData(heroUnitData: HeroUnitData): void {
        this._heroUnitData = heroUnitData;
        this._heroLimitDetailAttrNode = cc.resources.get(Path.getPrefab("HeroLimitDetailAttrNode", "heroTrain"));
        this._heroLimitDetailTalentNode = cc.resources.get(Path.getPrefab("HeroLimitDetailTalentNode", "heroTrain"));
    }

    onCreate() {
        this._textTitle.string = Lang.get('limit_break_title');
    }

    onEnter() {
        this._limitDataType = HeroDataHelper.getLimitDataType(this._heroUnitData);
        var baseId = this._heroUnitData.getBase_id();
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId);
        this._textName1.string = (heroParam.name);
        this._textName2.string = (heroParam.name);
        if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            this._textName1.node.color = (Colors.getColor(5));
            this._textName2.node.color = (Colors.getColor(6));
            UIHelper.disableOutline(this._textName2);
        } else {
            this._textName1.node.color = (Colors.getColor(6));
            this._textName2.node.color = (Colors.getColor(7));
            var txtColorOutline = Colors.getColorOutline(7);
            UIHelper.enableOutline(this._textName2, txtColorOutline, 2);
        }
        this._updateList();
    }
    onExit() {

    }
    _updateList() {
        this._listView.content.removeAllChildren();
        var module1 = this._buildAttrModule();
        var module2 = this._buildTalentModule();

        UIHelper.updateCurstomListSize(this._listView.content, module2.node)
        UIHelper.updateCurstomListSize(this._listView.content, module1.node)
        this._listView.scrollToTop();
    }
    private _buildAttrModule(): HeroLimitDetailAttrNode {
        var heroUnitData = this._heroUnitData;
        var attrModule = (cc.instantiate(this._heroLimitDetailAttrNode) as cc.Node).getComponent(HeroLimitDetailAttrNode) as HeroLimitDetailAttrNode;
        attrModule.setInitData(heroUnitData);
        return attrModule;
    }
    private _buildTalentModule(): HeroLimitDetailTalentNode {
        var heroUnitData = this._heroUnitData;
        var node = new cc.Node();
        var talentModule = cc.instantiate(this._heroLimitDetailTalentNode).getComponent(HeroLimitDetailTalentNode) as HeroLimitDetailTalentNode;
        talentModule.setInitData(heroUnitData);
        return talentModule;
    }
    private onButtonClose() {
        this.close();
    }

}