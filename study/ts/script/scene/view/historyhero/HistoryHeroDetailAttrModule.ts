import AttributeConst from "../../../const/AttributeConst";
import { Lang } from "../../../lang/Lang";
import CommonAttrNode from "../../../ui/component/CommonAttrNode";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroDetailAttrModule extends cc.Component {
    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr4: CommonAttrNode = null;
    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    updateUI(stepCfg) {
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('hero_detail_title_attr'));
        this._nodeAttr1.updateView(AttributeConst.ATK, stepCfg.atk, null, 4);
        this._nodeAttr2.updateView(AttributeConst.HP, stepCfg.hp, null, 4);
        this._nodeAttr3.updateView(AttributeConst.PD, stepCfg.pdef, null, 4);
        this._nodeAttr4.updateView(AttributeConst.MD, stepCfg.mdef, null, 4);
    }
}