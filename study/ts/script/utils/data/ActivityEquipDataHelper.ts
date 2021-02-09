import { Lang } from "../../lang/Lang";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { TypeConvertHelper } from "../TypeConvertHelper";

export namespace ActivityEquipDataHelper {
    export function getActiveConfig(id) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_ACTIVE).get(id);
        console.assert(info, 'equipment_active config can not find id = %d');
        return info;
    };
    export function getActiveDropConfig(id) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT_ACTIVE_DROP).get(id);
        console.assert(info, 'equipment_active_drop config can not find order = %d');
        return info;
    };
    export function getAwardRecordText(records) {
        let result = [];
        for (let i in records) {
            let record = records[i];
            let param = TypeConvertHelper.convert(record.type, record.id);
            let text = Lang.get('customactivity_equip_award_single_record', {
                name: param.name,
                count: record.num
            });
            let color = param.cfg.color;
            let unit = {
                text: text,
                color: color
            };
            result.push(unit);
        }
        return result;
    };
    export function randomCommonChat(batch) {
        let info = ActivityEquipDataHelper.getActiveConfig(batch);
        let index = Math.randInt(1, 5);
        let chat = info['chat_' + index];
        return chat;
    };
    export function randomHitChat(batch) {
        let info = ActivityEquipDataHelper.getActiveConfig(batch);
        let index = Math.randInt(1, 5);
        let chat = info['hit_chat_' + index];
        return chat;
    };
};
