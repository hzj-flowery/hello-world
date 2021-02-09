const { ccclass, property } = cc._decorator;

import CommonListCellBase from '../../../ui/component/CommonListCellBase'
import HeroFragListCell from '../hero/HeroFragListCell';
import { G_UserData } from '../../../init';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PetFragListCell extends HeroFragListCell {
    _setTopImage(image, heroID) {
        var isInBless = G_UserData.getTeam().isInHelpWithPetBaseId(heroID);
        var isInBattle = G_UserData.getTeam().isInBattleWithPetBaseId(heroID);
        if (isInBattle) {
            UIHelper.loadTexture(image, Path.getTextSignet('img_iconsign_shangzhen'));
            image.node.active = (true);
        } else if (isInBless) {
            UIHelper.loadTexture(image, Path.getTextSignet('img_iconsign_shangzhen'));
            image.node.active = (true);
        } else {
            image.node.active = (false);
        }
    }
}