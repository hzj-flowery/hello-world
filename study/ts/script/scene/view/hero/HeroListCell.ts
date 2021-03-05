import CommonListItem from "../../../ui/component/CommonListItem";

import CommonListCellBase from "../../../ui/component/CommonListCellBase";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";
import { G_UserData, G_Prompt } from "../../../init";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import HeroGoldHelper from "../heroGoldTrain/HeroGoldHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import PopupItemGuider from "../../../ui/PopupItemGuider";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroListCell extends CommonListItem {

    private static TOPIMAGERES = [
        "img_iconsign_shangzhen", //上阵
        "img_iconsign_yuanjun", //援军位
        "img_iconsign_jiban" //羁绊
    ]

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item1: CommonListCellBase = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTop1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTop2: cc.Sprite = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item2: CommonListCellBase = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen1: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen2: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAwake1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel2: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAwake2: CommonDesValue = null;

    onLoad() {
        this._buttonStrengthen1.setString(Lang.get('hero_btn_strengthen'));
        this._buttonStrengthen2.setString(Lang.get('hero_btn_strengthen'));

        this._buttonStrengthen1.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked1));
        this._buttonStrengthen2.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked2));
    }

    updateUI(index, itemLine) {
        this.updateCell(1, itemLine[0]);
        this.updateCell(2, itemLine[1]);
    }

    updateCell(index, heroId) {
        if (heroId) {
            if (typeof (heroId) != 'number') {
                return;
            }
            this['_item' + index].node.active = (true);
            var data = G_UserData.getHero().getUnitDataWithId(heroId);
            var [heroBaseId, isEquipAvatar, avatarLimitLevel,arLimitRedLevel]  = AvatarDataHelper.getShowHeroBaseIdByCheck(data);
            var limitLevel = avatarLimitLevel || data.getLimit_level();
            var limitRedLevel = arLimitRedLevel || data.getLimit_rtg()
            this['_item' + index].updateUI(TypeConvertHelper.TYPE_HERO, heroBaseId);
            this['_item' + index].getCommonIcon().getIconTemplate().updateUI(heroBaseId, null, limitLevel, limitRedLevel);
            this['_item' + index].setCallBack(handler(this, this['_onClickIcon' + index]));
            this._showTopImage(index, data);
            var params = this['_item' + index].getCommonIcon().getItemParams();
            var rank = data.getRank_lv();
            var heroName = params.name;
            if (rank > 0) {
                if (params.color == 7 && limitLevel == 0 && params.type != 1) {
                    heroName = heroName + (' ' + (Lang.get('goldenhero_train_text') + rank));
                } else {
                    heroName = heroName + ('+' + rank);
                }
            }
            var name = heroName;
            var [awakeStar, awakeLevel] = HeroDataHelper.convertAwakeLevel(data.getAwaken_level());
            if (!data.isPureGoldHero() && params.color == 7) {
                this['_item' + index].setName(name, params.icon_color, params);
            } else {
                this['_item' + index].setName(name, params.icon_color);
            }
            this['_item' + index].setTouchEnabled(true);
            if (data.isPureGoldHero()) {
                this['_nodeLevel' + index].updateUI(Lang.get('goldenhero_train_des'), rank, rank);
                this['_nodeLevel' + index].setMaxValue('');
            } else {
                this['_nodeLevel' + index].updateUI(Lang.get('hero_list_cell_level_des'), Lang.get('hero_txt_level', { level: data.getLevel() }));
            }
            this['_nodeAwake' + index].updateUI(Lang.get('hero_list_cell_awake_des'), Lang.get('hero_awake_star_level', {
                star: awakeStar,
                level: awakeLevel
            }));
            var isAwakeOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)[0];
            var isGold = HeroGoldHelper.isPureHeroGold(data);
            this['_nodeAwake' + index].setVisible(isAwakeOpen && !isGold);
            this['_buttonStrengthen' + index].setVisible(data.isCanTrain());
        } else {
            this['_item' + index].node.active = (false);
        }
    }
    _showTopImage(index, data) {
        var imageTop = this['_imageTop' + index];
        var isInBattle = data.isInBattle();
        var isInReinforcements = data.isInReinforcements();
        if (isInBattle) {
            UIHelper.loadTexture(imageTop, Path.getTextSignet(HeroListCell.TOPIMAGERES[0]));
            imageTop.node.active = (true);
        } else if (isInReinforcements) {
            UIHelper.loadTexture(imageTop, Path.getTextSignet(HeroListCell.TOPIMAGERES[1]));
            imageTop.node.active = (true);
        } else {
            var yokeCount = HeroDataHelper.getWillActivateYokeCount(data.getBase_id(), null, true)[0];
            if (yokeCount > 0) {
                UIHelper.loadTexture(imageTop, Path.getTextSignet(HeroListCell.TOPIMAGERES[2]));
                imageTop.node.active = (true);
            } else {
                imageTop.node.active = (false);
            }
        }
    }
    _onButtonStrengthenClicked1() {
        this.dispatchCustomCallback(0);
    }
    _onButtonStrengthenClicked2() {
        this.dispatchCustomCallback(1);
    }
    _onClickIcon1(sender, itemParams) {
        if (itemParams.cfg.type == 3) {
            UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
                popupItemGuider.updateUI(TypeConvertHelper.TYPE_HERO, itemParams.cfg.id);
                popupItemGuider.setTitle(Lang.get('way_type_get'));
            }.bind(this))
        } else {
            this.dispatchCustomCallback(0);
        }
    }
    _onClickIcon2(sender, itemParams) {
        if (itemParams.cfg.type == 3) {
            UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
                popupItemGuider.updateUI(TypeConvertHelper.TYPE_HERO, itemParams.cfg.id);
                popupItemGuider.setTitle(Lang.get('way_type_get'));
            }.bind(this))
        } else {
            this.dispatchCustomCallback(1);
        }
    }

}