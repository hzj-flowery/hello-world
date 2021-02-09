import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader, G_Prompt, G_ServerTime, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { Path } from "../../../utils/Path";

export namespace PopupHonorTitleHelper {
    let imageSize: {[key: string]: {width: number, height: number}}

    export function init(callback?: Function, progress?: CCProgress) {
        cc.resources.load('zm/title_image_size', cc.JsonAsset, progress, (err, res: cc.JsonAsset) => {
            imageSize = res.json;
            callback && callback();
        })
    }
    export function getConfigByTitleId(titleId) {
        let HonorTitleConfig = G_ConfigLoader.getConfig(ConfigNameConst.TITLE);
        let curTitleConfig = HonorTitleConfig.get(titleId);
        console.assert(curTitleConfig, 'not title by this id ' + titleId);
        return curTitleConfig;
    };
    export function getExpireTimeString(expireTime) {
        let leftTime = expireTime - G_ServerTime.getTime();
        let [day, hour, min, second] = G_ServerTime.convertSecondToDayHourMinSecond(leftTime);
        let dateStr = Lang.get('honor_expire_time').format(day);
        if (day < 1) {
            min = min < 1 && 1 || min;
            dateStr = '%02d:%02d'.format(hour, min);
        }
        return [
            dateStr,
            day < 1
        ];
    };
    export function getEquipedTitle() {
        let titleList = G_UserData.getTitles().getHonorTitleList();
        console.assert(titleList, 'title list is nil');
        for (let i = 0; i < titleList.length; i++) {
            if (titleList[i].isIsEquip()) {
                return titleList[i];
            }
        }
    };
    export function enoughLevelAndOpendayByTitleId(titleId) {
        if (titleId <= 0) {
            return false;
        }
        let curConfig = PopupHonorTitleHelper.getConfigByTitleId(titleId);
        if (UserCheck.enoughLevel(curConfig.limit_level) && UserCheck.enoughOpenDay(curConfig.day)) {
            return true;
        }
        return false;
    };
    export function getTitleImg(id) {
        let curConfig = PopupHonorTitleHelper.getConfigByTitleId(id);
        if (curConfig && curConfig.resource) {
            return Path.getChatFaceMiniRes(curConfig.resource);
        }

        return '';
    };
    export function showEquipTip(id) {
        if (id == 0) {
            G_Prompt.showTip(Lang.get('honor_title_unload_tip'));
        } else {
            G_Prompt.showTip(Lang.get('honor_title_equip_tip'));
        }
    };
    export function getTitleSize(titleId) {
        let curConfig = PopupHonorTitleHelper.getConfigByTitleId(titleId);
        if (!curConfig || !curConfig.resource) {
            return;
        }
        return PopupHonorTitleHelper.getTitleSizeByImageId(curConfig.resource);
    };
    export function getTitleSizeByImageId(imageId) {
        return imageSize[imageId];
    };

};