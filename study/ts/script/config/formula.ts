export namespace formula  {
    let funcs = [
        function(attr) {
            return ((attr.ATK*9+attr.PD*27+attr.MD*27+attr.HP*1)*(attr.HURT+attr.HURT_RED+attr.PVP_HURT+attr.PVP_HURT_RED+attr.HIT+attr.NO_HIT+attr.CRIT+attr.NO_CRIT+attr.CRIT_HURT+attr.CRIT_HURT_RED))/5+attr.TALENT_POWER;
        },
        function (attr) {
            return attr.HERO_POWER+attr.OFFICIAL_POWER;
        },

        function (attr) {

            return ((attr.ATK*9+attr.PD*27+attr.MD*27+attr.HP*1)*(attr.HURT+attr.HURT_RED+attr.PVP_HURT+attr.PVP_HURT_RED+attr.HIT+attr.NO_HIT+attr.CRIT+attr.NO_CRIT+attr.CRIT_HURT+attr.CRIT_HURT_RED))/5+attr.TALENT_POWER+attr.OFFICIAL_POWER/6+attr.AVATAR_POWER/6+attr.PET_POWER/6+attr.SILKBAG_POWER+attr.AVATAR_EQUIP_POWER+attr.TREE_POWER/6+attr.HORSE_POWER+attr.JADE_POWER+attr.HISTORICAL_HERO_POWER+attr.TACTICS_POWER;
        },

        function (attr) {
            return (attr.ATK*9+attr.PD*27+attr.MD*27+attr.HP*1)/5*2.5+attr.PET_INITIAL_POWER;
        }
    ]

    export function getFunc(id: number): (attr: any) => number {
        return funcs[id];
    }
    
}