import { SynthesisConst } from "../../const/SynthesisConst";

export namespace SynthesisDataHelper {
    export function getSynthesisDataLength(data) {
        if (data == null) {
            return 0;
        }
        let len = 0;
        for (let k in data) {
            let v = data[k];
            len = len + 1;
        }
        return len;
    };
    export function getSynthesisMaterilNum(configInfo) {
        if (configInfo == null) {
            return 0;
        }
        let num = 0;
        for (let index = 1; index <= SynthesisConst.MAX_MATERIAL_NUM; index++) {
            if (configInfo['material_size_' + index] && configInfo['material_size_' + index] > 0) {
                num = num + 1;
            }
        }
        return num;
    };

};