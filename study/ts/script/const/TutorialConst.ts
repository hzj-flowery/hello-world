export default class TutorialConst {
    public static STAGE_1 = 1


    // 新手引导步骤类型

    public static STEP_TYEP_CLICK = 1 // 引导点击
    public static STEP_TYEP_TALK = 2 // 对话
    public static STEP_TYEP_WAIT = 3 // 等待
    public static STEP_TYEP_JUMP = 4 // 跳转
    public static STEP_TYEP_SCRIPT = 5// 执行脚本

    public static STAGE_ACTIVE_LEVEL = 1 // 新手引导等级触发
    public static STAGE_ACTIVE_STORY = 2 // 新手引导关卡触发
    public static STAGE_ACTIVE_BOX_AWARD = 3 // 新手引导宝箱ID
    public static STAGE_EXPLORE_FINISH_AWARD = 4 // 新手引导通关奖励
    public static STAGE_REBEL_EVENT = 5 // 新手引导南蛮入侵触发
    public static STAGE_SCRIPT_CHECK = 10 // 新手引导脚本逻辑条件出发

    public static getStageName = function (resId) {
        for (var key in TutorialConst) {
            var value = TutorialConst[key];
            if (key.indexOf('STAGE_') > -1 && value == resId) {
                var retName = key.replace('STAGE_', '');
                return retName.toLowerCase();
            }
        }
        return '';
    };
    public static getStepTypeName = function (stepType) {
        for (var key in TutorialConst) {
            var value = TutorialConst[key];
            if (key.indexOf('STEP_TYEP_') > -1 && value == stepType) {
                return key;
            }
        }
        return '';
    };
}