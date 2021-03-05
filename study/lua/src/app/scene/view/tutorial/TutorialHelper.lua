local TutorialHelper = {}
local TutorialInfo = require("app.config.guide")

TutorialHelper.STEP_PAUSE = 30000

-- 搜索出来所有的有条件限制的步数，这些属于中间可能出现的步数
function TutorialHelper.getStageList()
	local function condition(info)
		if info.id % 100 == 0 then
			return true
		end
		return false
	end

	local values = {}
	for i=1, TutorialInfo.length() do
		local info = TutorialInfo.indexOf(i)
		if condition(info) then
			values[#values+1] = info
		end
	end

	return values
end

function TutorialHelper.getStageIdById(stepId)
	local stepInfo = TutorialInfo.get(stepId)
	assert(stepInfo, "can not find TutorialInfo by stepId : "..stepId)
	return stepInfo.stage
end

function TutorialHelper.getStageByStepId(stepId)
	local stepInfo = TutorialHelper.getStepInfo(stepId)
	return TutorialHelper.getStageById(stepInfo.stage)
end

function TutorialHelper.getStageById( stageId )
	
	local function condition(info)
		if info.id % 100 == 0 and info.stage == stageId then
			return true
		end
		return false
	end

	for i=1, TutorialInfo.length() do
		local info = TutorialInfo.indexOf(i)
		if condition(info) then
			return info
		end
	end

	return nil
end

--根据stageId，获得stepList。
--忽略第一条数据（目前第一条数据默认留空）
function TutorialHelper.getStepList(stageId)
	local function condition(info)
		if info.stage == stageId and info.id % 100 ~= 0 then
			return true
		end
		return false
	end

	local function conditionStage(info)
		if info.stage == stageId and info.id % 100 == 0 then
			return true
		end
		return false
	end

	local currStage = nil
	local values = {}
	for i=1, TutorialInfo.length() do
		local info = TutorialInfo.indexOf(i)
		if conditionStage(info) then
			currStage = info
		end
		if condition(info) then
			values[#values+1] = info
		end
	end

	return values,currStage
end

function TutorialHelper.createStage(stageId)
	local TutorialStageBase = require("app.scene.view.tutorial.TutorialStepBase")
	local stepBase = TutorialStepBase.new(stageId)
	return stepBase
end


function TutorialHelper.getStepInfo(stepId)
	local stepInfo = TutorialInfo.get(stepId)
	assert(stepInfo, "can not find TutorialInfo by stepId : "..stepId)
	return stepInfo
end

function TutorialHelper.isStartStep(stepId)
	local stepInfo = TutorialHelper.getStepInfo(stepId)
	if stepId % 100 == 0 then
		return true, stepInfo
	end
	return false
end


--根据stepId判定该step是否在stage最后一步
function TutorialHelper.isEndStep(stepId)
	local stepInfo = TutorialHelper.getStepInfo(stepId)
	local stageList = TutorialHelper.getStageById(stepInfo.stage)
	
	--下一阶段是暂停阶段
	if stepInfo.next_stage == TutorialHelper.STEP_PAUSE then
		if stageList and #stageList > 0 then
			local stepInfoEnd = stageList[#stageList]
			if stepInfoEnd.id == stepInfo.id then
				--下一阶段
				return true
			end
		end
	end

	return false
end

return TutorialHelper