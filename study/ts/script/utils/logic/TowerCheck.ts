import { G_UserData, G_Prompt } from "../../init";
import { Lang } from "../../lang/Lang";

export namespace TowerCheck {

    export function checkTowerCanChallenge (layerId, popHint) {
        var success = true;
        var popFunc = null;
        if (popHint == null) {
            popHint = true;
        }
        var nextLayer = G_UserData.getTowerData().getNextLayer();
        var nowLayer = G_UserData.getTowerData().getNow_layer();
        if (layerId == nextLayer) {
            if (nextLayer == nowLayer) {
                success = false;
                popFunc = function () {
                    G_Prompt.showTip(Lang.get('challenge_tower_already'));
                };
            }
        } else if (layerId > nextLayer) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('challenge_tower_not_reach'));
            };
        } else if (layerId < nextLayer) {
            success = false;
            popFunc = function () {
                G_Prompt.showTip(Lang.get('challenge_tower_already'));
            };
        }
        if (popHint && popFunc) {
            popFunc();
        }
        return [
            success,
            popFunc
        ];
    };
}