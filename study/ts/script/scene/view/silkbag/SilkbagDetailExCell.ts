const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import CommonListItem from '../../../ui/component/CommonListItem';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { SilkbagDataHelper } from '../../../utils/data/SilkbagDataHelper';
import { Lang } from '../../../lang/Lang';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { G_ConfigLoader } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class SilkbagDetailExCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label = null;


    protected updateUI(itemId, data) {
        this.update1(data[0], data[1]);
    }

    update1(silkId, heroBaseId) {
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        var strLimit = '';
        var strDes = '';
        if (silkId > 0) {
            var info = SilkbagDataHelper.getSilkMappingConfig(silkId, heroBaseId);
            var limitRank = SilkbagDataHelper.getLimitRankForEffective(info);
            var limitLevel = SilkbagDataHelper.getLimitLevelForEffective(info);
            var limitRedLevel = SilkbagDataHelper.getRedLimitLevelForEffective(info);
            if (limitRank!=null) {
                if (limitRank > 0) {
                    strLimit = Lang.get('silkbag_effective_rank_ex', { rank: limitRank });
                }
            } else if (info.effective_5 == 1) {
                var heroInfo = HeroDataHelper.getHeroConfig(heroBaseId);
                var instrumentMaxLevel = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(heroInfo.instrument_id).level_max;
                strLimit = Lang.get('silkbag_effective_instrument_ex', { level: instrumentMaxLevel });
            } else if (limitLevel > 0) {
                var heroInfo = HeroDataHelper.getHeroConfig(heroBaseId);
                if (heroInfo.limit == 1) {
                    strLimit = Lang.get('silkbag_effective_limit_ex', { limit: limitLevel });
                }
            } else if (limitRedLevel > 0) {
                var heroInfo = HeroDataHelper.getHeroConfig(heroBaseId);
                if (heroInfo.limit_red == 1) {
                    strLimit = Lang.get('silkbag_effective_red_limit_ex', { limit: limitRedLevel });
                }
            }
        }
        this._fileNodeIcon.updateUI(heroBaseId);
        this._textName.string = (heroParam.cfg.name + (' ' + strLimit));
        this._textName.node.color = (heroParam.icon_color);
        UIHelper.updateTextOutline(this._textName, heroParam);
        // this._textDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        // this._textDes.enableWrapText = true;
        this._textDes.string = info.description;
    }
}