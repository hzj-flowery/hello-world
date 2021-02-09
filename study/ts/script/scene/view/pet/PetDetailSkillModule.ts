const {ccclass, property} = cc._decorator;
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import PetDetailSkillCell from "./PetDetailSkillCell";

@ccclass
export default class PetDetailSkillModule extends CommonDetailDynamicModule {

    @property(cc.Prefab)
    detailTitleWithBg:cc.Prefab = null;

    @property(cc.Prefab)
    detailSkillCell:cc.Prefab = null;

    private _skillIds:any[];
    private _showSkillDetail:any;
    private _petBaseId:any;
    private _petStar:any;
    private _petUnitData:any;
    private _isLoaded:boolean;

    ctor(skillIds, showSkillDetail, petBaseId, petStar, petUnitData?) {
        this._skillIds = skillIds;
        this._showSkillDetail = showSkillDetail;
        this._petBaseId = petBaseId;
        this._petStar = petStar;
        this._petUnitData = petUnitData;
    }
    onCreate() {
        if(this._isLoaded){
            return;
        }
        this._isLoaded = true;
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        for (var i=0; i<this._skillIds.length; i++) {
            var skillId = this._skillIds[i];
            var node = cc.instantiate(this.detailSkillCell);
            var cell = node.getComponent(PetDetailSkillCell);
            cell.ctor(skillId, this._showSkillDetail, this._petBaseId, this._petStar, this._petUnitData);
            cell.onCreate();
            this._listView.pushBackCustomItem(cell.node);
        }
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var node = cc.instantiate(this.detailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('hero_detail_title_skill'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 41);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2);
        widget.addChild(title.node);
        return widget;
    }
}
