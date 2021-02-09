export namespace BattleHelper {
    export function parseDamage(damageInfo) {
        var hpValue = damageInfo.value || 0;
        var protectValue = damageInfo.protect || 0;
        var showValue = damageInfo.showValue || 0;
        if (damageInfo.type == 1) {
            hpValue = -hpValue;
            showValue = -showValue;
        }
        if (damageInfo.pType == 1) {
            protectValue = -protectValue;
        }
        return [
            hpValue,
            protectValue,
            showValue
        ];
    };
}
