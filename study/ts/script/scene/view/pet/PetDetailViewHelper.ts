import { G_UserData, Colors } from "../../../init";
import PetConst from "../../../const/PetConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Lang } from "../../../lang/Lang";
import { RichTextExtend } from "../../../extends/RichTextExtend";

export var PetDetailViewHelper: any = {};
PetDetailViewHelper.makeSkillEx = function (petUnitId, skillId, petUnitData) {
    var skillDescList = [];
    var petUnit = G_UserData.getPet().getUnitDataWithId(petUnitId);
    if (petUnitData) {
        petUnit = petUnitData;
    }
    if (petUnit == null) {
        //logWarn('can not find petUnit by petId ' + petUnitId);
        return;
    }
    var MIN_LEVEL = 0;
    var Initial_star = petUnit.getInitial_star();
    if (Initial_star > 0) {
        MIN_LEVEL = Initial_star;
    } else {
        MIN_LEVEL = petUnit.getQuality() == PetConst.QUALITY_RED ? 1 : 0;
    }
    function getSkillIndex(petUnitId, skillId) {
        function findIndex(config, skillId) {
            for (var i = 1; i <= 2; i++) {
                var cfgSkillId = config['skill' + i];
                if (cfgSkillId > 0 && cfgSkillId == skillId) {
                    return i;
                }
            }
            return 0;
        }
        for (var i = MIN_LEVEL; i <= petUnit.getStarMax(); i++) {
            var config = UserDataHelper.getPetStarConfig(petUnit.getBase_id(), i);
            var skillIndex = findIndex(config, skillId);
            if (skillIndex > 0) {
                return skillIndex;
            }
        }
        return 0;
    }
    var skillIndex = getSkillIndex(petUnitId, skillId);
    if (skillIndex == 0) {
        return {};
    }
    var skillSameId = {};
    for (var i = MIN_LEVEL; i <= petUnit.getStarMax(); i++) {
        var config = UserDataHelper.getPetStarConfig(petUnit.getBase_id(), i);
        var cfgSkillId = config['skill' + skillIndex];
        if (cfgSkillId > 0) {
            var pendingSkill = '';
            if (config.skill2 == cfgSkillId) {
                pendingSkill = config.chance_description;
            }
            skillSameId[cfgSkillId] = true;
            skillDescList.push({
                title: Lang.get('pet_skill_detail_title', { star: i }),
                skillId: cfgSkillId,
                pendingStr: pendingSkill
            });
        }
    }
    return skillDescList;
};
PetDetailViewHelper.createTalentDes = function (petUnitData, star, width, posOffset) {
    function isActiveWithStar(star) {
        var starLevel = petUnitData.getStar();
        return starLevel >= star;
    }
    var widget = new cc.Node();
    var isActive = petUnitData.isUserPet() && isActiveWithStar(star);
    var color = isActive && Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) || Colors.colorToNumber(Colors.BRIGHT_BG_TWO);
    var config = UserDataHelper.getPetStarConfig(petUnitData.getBase_id(), star);
    var name = '[' + (config.talent_name + '] ');
    var des = config.talent_description;
    var arr = des.split('\n');
    des = arr.join('\\n');
    var breakDes = isActive && '' || Lang.get('pet_break_txt_break_des', { rank: star });
    var txt = name + (des + breakDes);
    var content = Lang.get('hero_detail_talent_des_1', {
        des: txt,
        color: color
    });
    width = width || 360;
    posOffset = posOffset || 24;
    var node = new cc.Node();
    var label = RichTextExtend.createWithContent(content);
    label.node.setAnchorPoint(cc.v2(0, 1));
    label.maxWidth = width;
    var height = label.node.getContentSize().height;
    label.node.setPosition(cc.v2(posOffset, height + 10));
    widget.addChild(label.node);
    var size = cc.size(width, height + 10);
    widget.setContentSize(size);
    return widget;
};
