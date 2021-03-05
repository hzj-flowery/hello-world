--TutorialConst
--
local TutorialConst = {}

TutorialConst.STAGE_1 = 1


--新手引导步骤类型

TutorialConst.STEP_TYEP_CLICK = 1 --引导点击
TutorialConst.STEP_TYEP_TALK  = 2 --对话
TutorialConst.STEP_TYEP_WAIT  = 3 --等待
TutorialConst.STEP_TYEP_JUMP  = 4 --跳转
TutorialConst.STEP_TYEP_SCRIPT = 5--执行脚本

TutorialConst.STAGE_ACTIVE_LEVEL = 1 --新手引导等级触发
TutorialConst.STAGE_ACTIVE_STORY = 2 --新手引导关卡触发
TutorialConst.STAGE_ACTIVE_BOX_AWARD = 3 --新手引导宝箱ID
TutorialConst.STAGE_EXPLORE_FINISH_AWARD = 4 --新手引导通关奖励
TutorialConst.STAGE_REBEL_EVENT = 5 --新手引导南蛮入侵触发
TutorialConst.STAGE_SCRIPT_CHECK = 10 --新手引导脚本逻辑条件出发
function TutorialConst.getStageName(resId)
    for key, value in pairs(TutorialConst) do
        if string.find(key,"STAGE_") and value == resId then
            local retName = string.gsub(key,"STAGE_","")
            return string.lower(retName) 
        end
    end
    return ""
end


function TutorialConst.getStepTypeName(stepType)
    for key, value in pairs(TutorialConst) do
        if string.find(key,"STEP_TYEP_") and value == stepType then
            return key
        end
    end
    return ""
end


return TutorialConst
