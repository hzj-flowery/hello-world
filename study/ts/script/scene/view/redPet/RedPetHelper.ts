import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader, G_UserData } from "../../../init";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";


var bezierFix = function(posStart, posMid, posEnd, t) {
    return Math.pow(1 - t, 2) * posStart + 2 * t * (1 - t) * posMid + Math.pow(t, 2) * posEnd;
};
var bezierAngle = function (posStart, posEnd, t) {
    return posStart + (posEnd - posStart) * t;
};
export namespace RedPetHelper{

export function getBezierPosition(bezier:Array<cc.Vec2>, t) {
    var xa = bezier[0].x;
    var xb = bezier[1].x;
    var xc = bezier[2].x;
    var ya = bezier[0].y;
    var yb = bezier[1].y;
    var yc = bezier[2].y;
    return [
        bezierFix(xa, xb, xc, t),
        bezierFix(ya, yb, yc, t)
    ];
};
export function getBezierPositionAndAngle(bezier:Array<cc.Vec2>, t) {
    var xa = bezier[0].x;
    var xb = bezier[1].x;
    var xc = bezier[2].x;
    var ya = bezier[0].y;
    var yb = bezier[1].y;
    var yc = bezier[2].y;
    var posx1 = bezierAngle(xa, xb, t);
    var posy1 = bezierAngle(ya, yb, t);
    var posx2 = bezierAngle(xb, xc, t);
    var posy2 = bezierAngle(yb, yc, t);
    var angle = Math.atan2(posy2 - posy1, posx2 - posx1);
    var angleRet = -Math.floor(angle * 180 / 3.14);
    return [
        bezierFix(xa, xb, xc, t),
        bezierFix(ya, yb, yc, t),
        angleRet
    ];
};
export function getPreAwardInfo() {
    var groupIds = G_UserData.getRedPetData().getOrange_pool_id();
    var awards = [];
    var pet_red_activity = G_ConfigLoader.getConfig(ConfigNameConst.PET_RED_ACTIVITY);
   
    var length = pet_red_activity.length();
    table.insert(awards, {
        type: 10,
        value: 201,
        size: 1
    });
    for (let k in groupIds) {
        var v = groupIds[k];
        for (var id = 0; id < length; id++) {
            var configInfo = pet_red_activity.indexOf(id);
            if (configInfo.group == v && configInfo.type == TypeConvertHelper.TYPE_PET) {
                table.insert(awards, {
                    type: configInfo.type,
                    value: configInfo.value,
                    size: configInfo.size
                });
            }
        }
    }
    table.insert(awards, {
        type: 6,
        value: 718,
        size: 1
    });
    table.insert(awards, {
        type: 6,
        value: 89,
        size: 1
    });
    return awards;
};
export function getShowPetsInfo() {
    var groupIds = G_UserData.getRedPetData().getOrange_pool_id();
    var pets = [];
    var pet_red_activity = G_ConfigLoader.getConfig(ConfigNameConst.PET_RED_ACTIVITY);
    var length = pet_red_activity.length();
    table.insert(pets, { petId: 201 });
    for (let k in groupIds) {
        var v = groupIds[k];
        for (var id = 1; id != length; id++) {
            var configInfo = pet_red_activity.indexOf(id);
            if (configInfo.group == v && configInfo.type == TypeConvertHelper.TYPE_PET) {
                table.insert(pets, { petId: configInfo.value });
            }
        }
    }
    return pets;
};
export function checkRectIntersects(rect1, rect2) {
};
}