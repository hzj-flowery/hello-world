import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader, G_ServerTime, G_UserData } from "../../../init";
/**
 * id	name	title	picture	time	type	parameter	cost
 */
export namespace MilitaryMasterPlanHelper {
    export const Type_HeroBreakResult = 1; //武将突破
    export const Type_Instrument = 2;//神兵进阶
    export const Type_HeroZhaoMu = 3;//武将招募
    export const Type_HeroMerge = 4; //武将合成

    function sort(total: any[]): any {
        //分类型
        let typeArr = [];
        let ret = [];
        for (let i = 0; i < total.length; i++) {
            typeArr.indexOf(total[i].type) < 0 ? typeArr.push(total[i].type) : 0;
        }
        if (typeArr.length >= 2) {
            typeArr.sort(function (a, b): number {
                return a - b;
            });
        }
        for (let i = 0; i < typeArr.length; i++) {
            let curType = typeArr[i];
            let tempArr = [];
            total.forEach((value, index) => {
                if (value.type == curType) {
                    tempArr.push(value);
                }
            });
            if(tempArr.length>1)
            {
                tempArr.sort((a,b):number=>{
                   return a.time - b.time
                })
            }
            ret.push(tempArr);
        }
        return ret;
    }
    function produceItem(superBaseConfig, id: number, award_id: number, time: number): any {
        let curConfig = superBaseConfig.get(award_id);
        let temp: any = {};
        temp.name = curConfig.name;
        temp.title = curConfig.title;
        temp.award_id = curConfig.id;
        temp.type = curConfig.type;
        temp.id = id;
        temp.cost = curConfig.cost;    //价格
        temp.parameter = curConfig.parameter;//达到的等级
        temp.time = time;//秒

        temp.rewards = [];       //奖品
        let i = 1;
        let typeTemp = "type_" + i;
        let valueTemp = "value_" + i;
        let sizeTemp = "size_" + i;
        do {
            if (curConfig[typeTemp] != null && curConfig[valueTemp] != null && curConfig[sizeTemp] != null) {
                if (!(curConfig[typeTemp] == 0 && curConfig[valueTemp] == 0 && curConfig[sizeTemp] == 0)) {
                    let subTemp: any = {};
                    subTemp.type = curConfig[typeTemp];
                    subTemp.value = curConfig[valueTemp];
                    subTemp.size = curConfig[sizeTemp];
                    temp.rewards.push(subTemp);
                }
            }
            i++;
            typeTemp = "type_" + i;
            valueTemp = "value_" + i;
            sizeTemp = "size_" + i;
        } while (curConfig[typeTemp] != null && curConfig[valueTemp] != null && curConfig[sizeTemp] != null);
        return temp;
    }
    /**
     * 充值妙计是否开启
     * @param id 
     * @param level 
     */
    export function isOpen(type: number, parameter: number): boolean {
        let superBaseConfig = G_ConfigLoader.getConfig(ConfigNameConst.SUPER_LEVEL_GIFT);
        let len = superBaseConfig.length();
        let tempArr = [];
        for (var j = 1; j <= len; j++) {
            let config = superBaseConfig.get(j);
            if (config && config["type"] == type) {
                tempArr.push(config["parameter"]);
            }
        }
        return tempArr.indexOf(parameter) >= 0;
    }
    export function parseSuperLevelGiftInforMessage(message: any): Array<any> {
        let infor = message["info"];
        let ret = [];
        if (infor && infor.length > 0) {
            //说明有资源
            let superBaseConfig = G_ConfigLoader.getConfig(ConfigNameConst.SUPER_LEVEL_GIFT);
            for (let i = 0; i < infor.length; i++) {
                let nowtime = G_ServerTime.getTime();
                let time = infor[i]["end_time"] - nowtime;
                if (nowtime < infor[i]["end_time"] && (nowtime+10) > infor[i]["begin_time"]) {
                    ret.push(produceItem(superBaseConfig, infor[i]["id"], infor[i]["award_type"], time));
                }
            }
            ret = sort(ret);
        }
        return ret;
    }
    //是否需要在主界面显示军师妙计的入口按钮
    export function isNeedShowTipsBtn():boolean{
          return G_UserData.getMilitaryMasterPlan().getSuperLevelGiftData().length>0;
    }
}