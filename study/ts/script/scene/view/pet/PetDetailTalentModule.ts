const {ccclass, property} = cc._decorator;
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import PetDetailSkillCell from "./PetDetailSkillCell";
import { PetDetailViewHelper } from "./PetDetailViewHelper";

@ccclass
export default class PetDetailTalentModule extends CommonDetailDynamicModule {

    @property(cc.Prefab)
    detailTitleWithBg:cc.Prefab = null;

    private _petUnitData:any;

    ctor(petUnitData) {
        this._petUnitData = petUnitData;
        this.onInit();
   }
    onInit() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var starMax = this._petUnitData.getStarMax();
        var initial_star = Math.max(1, this._petUnitData.getInitial_star())
        for (var i = initial_star; i<=starMax; i++) {
            var des = PetDetailViewHelper.createTalentDes(this._petUnitData, i);
            this._listView.pushBackCustomItem(des);
        }
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        contentSize.height = contentSize.height;
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
   }
    _isActiveWithRank(rank) {
        var rankLevel = this._petUnitData.getStar();
        return rankLevel >= rank;
   }
    _createTitle() {
        var node = cc.instantiate(this.detailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('pet_detail_title_talent'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 34);
        var widgetSize = cc.size(402, 34 + 10);
        widget.setContentSize(widgetSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2 + 10);
        widget.addChild(title.node);
        return widget;
    }
}
