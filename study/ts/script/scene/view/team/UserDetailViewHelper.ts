import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { HeroConst } from "../../../const/HeroConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { FunctionConst } from "../../../const/FunctionConst";

export namespace UserDetailViewHelper{
    export let getHeroAndPetShowData = function (detailData) {
        var heroDatas = detailData.getHeroDataInBattle();
        var result = [];
        for (var i in heroDatas) {
            var unitData = heroDatas[i];
            var avatarBaseId = detailData.getAvatarBaseId();
            var limitLevel = unitData.getLimit_level();
            var limitRedLevel = unitData.getLimit_rtg()
            var heroBaseId = null;
            if (avatarBaseId > 0 && unitData.isLeader()) {
                var info = AvatarDataHelper.getAvatarConfig(avatarBaseId);
                heroBaseId = info.hero_id;
                if (info.limit == 1) {
                    limitLevel = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
                }
            } else {
                heroBaseId = unitData.getBase_id();
            }
            var baseId = heroBaseId;
            var info1 = {
                type: TypeConvertHelper.TYPE_HERO,
                value: baseId,
                id: unitData.getId(),
                limitLevel: limitLevel,
                limitRedLevel : limitRedLevel
            };
            result.push(info1);
        }
        var petId = detailData.getOnTeamPetId();
        if (petId > 0) {
            var unitData = detailData.getPetUnitDataWithId(petId);
            var baseId = unitData.getBase_id();
            var info2 = {
                type: TypeConvertHelper.TYPE_PET,
                value: baseId,
                id: unitData.getId()
            };
            result.push(info2);
        }
        return result;
    };
    export let getHeroAndPetIconData = function (detailData) {
        var result = [];
        var heroIds = detailData.getFormation();
        for (var i in heroIds) {
            var heroId = heroIds[i];
            var baseId = 0;
            var limitLevel = 0;
            var limitRedLevel = 0
            if (heroId > 0) {
                var unitData = detailData.getHeroDataWithId(heroId);
                limitLevel = unitData.getLimit_level();
                limitRedLevel = unitData.getLimit_rtg()
                var avatarBaseId = detailData.getAvatarBaseId();
                if (avatarBaseId > 0 && unitData.isLeader()) {
                    var info = AvatarDataHelper.getAvatarConfig(avatarBaseId);
                    baseId = info.hero_id;
                    if (info.limit == 1) {
                        limitLevel = HeroConst.HERO_LIMIT_MAX_LEVEL;
                    }
                } else {
                    baseId = unitData.getBase_id();
                }
            }
            var info1 = {
                type: TypeConvertHelper.TYPE_HERO,
                value: baseId,
                id: heroId,
                limitLevel: limitLevel,
                limitRedLevel : limitRedLevel
            };
            result.push(info1);
        }
        var petIsShow = detailData.funcIsShow(FunctionConst.FUNC_PET_HOME);
        if (petIsShow) {
            var petBaseId = 0;
            var petId = detailData.getOnTeamPetId();
            if (petId > 0) {
                var unitData = detailData.getPetUnitDataWithId(petId);
                petBaseId = unitData.getBase_id();
            }
            var petInfo = {
                type: TypeConvertHelper.TYPE_PET,
                value: petBaseId,
                id: petId
            };
            result.push(petInfo);
        }
        return result;
    };
    /**
     * 
     * @param pageIndex （列表框实际的位置）
     * @param detailData 
     * //下标从0走
     */
    export let getIconPosWithPageIndex = function (pageIndex, detailData):number {
        var showDatas = UserDetailViewHelper.getHeroAndPetShowData(detailData);
        var showData = showDatas[pageIndex];
        if (showData) {
            var iconDatas = UserDetailViewHelper.getHeroAndPetIconData(detailData);
            for (var i = 0;i<iconDatas.length;i++) {
                var data = iconDatas[i];
                if (showData.type == data.type && showData.id == data.id) {
                    return i;
                }
            }
        }
        return 0;
    };
    /**
     * 
     * @param iconPos (列表框实际的位置)
     * @param detailData
     * * //下标从0走 
     */
    export let getPageIndexWithIconPos = function (iconPos, detailData):number {
        var iconDatas = UserDetailViewHelper.getHeroAndPetIconData(detailData);
        var iconData = iconDatas[iconPos];
        if (iconData) {
            var showDatas = UserDetailViewHelper.getHeroAndPetShowData(detailData);
            for (var i=0;i<showDatas.length;i++) {
                var data = showDatas[i];
                if (iconData.type == data.type && iconData.id == data.id) {
                    return i;
                }
            }
        }
        return 0;
    };
}