const {ccclass, property} = cc._decorator;
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import HorseConst from "../../../const/HorseConst";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { HorseDataHelper } from "../../../utils/data/HorseDataHelper";
import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";

@ccclass
export default class HorseDetailSkillNode extends CommonDetailDynamicModule {

    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode:cc.Node = null;

    @property(cc.Prefab)
    detailTitleWithBg:cc.Prefab = null;

    private _horseData:any;
    ctor(horseData) {
        this._horseData = horseData;
        this.onInit();
    }
    onInit() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var desText:string = '';
        for (var star = 1; star<=HorseConst.HORSE_STAR_MAX; star++) {
            var des = this._createDes(star);
            if(star > 1){
                desText += '\n';
                desText += '\n';
            }
            desText += des;
            //this._listView.pushBackCustomItem(des);
        }
        var desNode = UIHelper.createDetailDesEx(this._textDesNode, desText);;
        this._listView.pushBackCustomItem(desNode);
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        // var title = cc.instantiate(this.detailTitleWithBg).getComponent(CommonDetailTitleWithBg);
        // title.setFontSize(24);
        // title.setTitle(Lang.get('horse_detail_title_skill'));
        // var widget = new cc.Node();
        // var titleSize = cc.size(402, 50);
        // widget.setContentSize(titleSize);
        // title.node.setPosition(titleSize.width / 2, 30);
        // widget.addChild(title.node);
        // return widget;

        return UIHelper.createDetailTitleWithBg('horse_detail_title_skill', this.detailTitleWithBg);
    }
    _createDes(star) {
        var horseId = this._horseData.getBase_id();
        var curStar = this._horseData.getStar();
        var info = HorseDataHelper.getHorseStarConfig(horseId, star);
        var des = info.skill;
        var isActive = curStar >= star;
        var color = Colors.BRIGHT_BG_TWO;
        if (this._horseData.isUser()) {
            color = isActive && Colors.SYSTEM_TARGET_RED || Colors.BRIGHT_BG_TWO;
        }
        var unlockDes = Lang.get('horse_detail_skill_unlock_des', { star: star });
        var txt = Lang.get('horse_detail_skill_des', {
            des: des,
            unlock: unlockDes
        });
        return txt;
    }
}
