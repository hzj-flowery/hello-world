import ListViewCellBase from "../../../ui/ListViewCellBase";
import { TreasureUnitData } from "../../../data/TreasureUnitData";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { G_UserData, Colors, G_ConfigLoader } from "../../../init";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import UIHelper from "../../../utils/UIHelper";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import TeamViewHelper from "../team/TeamViewHelper";
import { Path } from "../../../utils/Path";
import TreasureDetailYokeNode from "./TreasureDetailYokeNode";
import { ConfigNameConst } from "../../../const/ConfigNameConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TreasureDetailYokeModule extends CommonDetailDynamicModule {
    @property({
        type: cc.Prefab,
        visible: true
    })
    detailTitleWithBg:cc.Prefab = null;

    @property(cc.Node)
    yokeNode:cc.Node = null;

    @property(cc.Node)
    desNode:cc.Node = null;

    _yokeInfo;
    _treasureId;
    _width;

    init(yokeInfo, treasureId, width?) {
        this._yokeInfo = yokeInfo
        this._treasureId = treasureId
        this._width = width
        this.onInit();
    }
    onInit() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        for (let i in this._yokeInfo) {
            var one = this._yokeInfo[i];
            var heroIds = one.heroIds;
            for (let j in heroIds) {
                var heroId = heroIds[j];
                var node = cc.instantiate(this.yokeNode);
                var treasureDetailYokeNode = node.getComponent(TreasureDetailYokeNode);
                var isActivated = UserDataHelper.checkIsEquipInHero(this._treasureId, heroId);
                treasureDetailYokeNode.updateViewEx(one, heroId, isActivated);
                if (this._width) {
                    treasureDetailYokeNode.setImageBgLength(this._width);
                }
                this._listView.pushBackCustomItem(treasureDetailYokeNode.node);
                var widgetCondition = this._createWidgetCondition(one, heroId, isActivated);
                this._listView.pushBackCustomItem(widgetCondition);
                var widgetLine = this._createWidgetLine();
                this._listView.pushBackCustomItem(widgetLine);
            }
        }
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        return UIHelper.createDetailTitleWithBg(Lang.get('treasure_detail_title_yoke'), this.detailTitleWithBg);
    }
    _createWidgetCondition(data, heroId, isActivated) {
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId);
        var name = param.name;
        if (param.cfg.type == 1) {
            var gender = param.cfg.gender;
            var myGender = G_UserData.getBase().isMale() && 1 || 2;
            var isSelf = gender == myGender;
            if (!isSelf) {
                name = Lang.get('common_gender_role_' + gender);
            }
        }
        var attrDes = '';
        var attrInfo = data.attrInfo;
        var attrConfig = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE);
        for (var i = 0; i<attrInfo.length; i++) {
            var attr = attrInfo[i];
            var text = Lang.get('hero_detail_yoke_attr_value', {
                attr: attrConfig.get(attr.attrId).cn_name,
                value: Math.floor(attr.attrValue / 10)
            });
            attrDes = attrDes + text;
        }
        var yokeDes = Lang.get('treasure_detail_yoke_des', {
            name: name,
            attrDes: attrDes
        });
        var totalDes = yokeDes;
        if (!isActivated && param.cfg.type == 1) {
            var officialName = HeroDataHelper.getOfficialNameWithHeroId(heroId);
            var tipDes = Lang.get('treasure_detail_yoke_role_tip', { official: officialName });
            totalDes = yokeDes + tipDes;
        }
        var color = isActivated && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        return UIHelper.createDetailDesEx(this.desNode, totalDes, color);
    }
    _createWidgetLine() {
        var widget = new cc.Node();
        var line = TeamViewHelper.createLine(402);
        widget.addChild(line);
        widget.setContentSize(line.getContentSize());
        return widget;
    }
}
