--@Author:Conley

local BaseData = require("app.data.BaseData")
local QuestionnaireUnitData = require("app.data.QuestionnaireUnitData")
local QuestionnaireData = class("QuestionnaireData", BaseData)
local schema = {}
QuestionnaireData.schema = schema

function QuestionnaireData:ctor(properties)
	QuestionnaireData.super.ctor(self, properties)
    self._questionnaireUnitDatas = {}
    self._sendedQidCache = 0
    self._s2cGetQuestionnaireInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetQuestionnaireInfo, handler(self, self._s2cGetQuestionnaireInfo))
    self._s2cQuestionnaireListener = G_NetworkManager:add(MessageIDConst.ID_S2C_Questionnaire, handler(self, self._s2cQuestionnaire))
    self._s2cUpdateQuestionnaireInfoListener = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateQuestionnaireInfo, handler(self, self._s2cUpdateQuestionnaireInfo))
    
end

-- 清除
function QuestionnaireData:clear()
    self._s2cGetQuestionnaireInfoListener:remove()
    self._s2cGetQuestionnaireInfoListener = nil

    self._s2cQuestionnaireListener:remove()
    self._s2cQuestionnaireListener = nil

    self._s2cUpdateQuestionnaireInfoListener:remove() 
    self._s2cUpdateQuestionnaireInfoListener = nil
end

-- 重置
function QuestionnaireData:reset()
	self._questionnaireUnitDatas = {}
end

function QuestionnaireData:_s2cGetQuestionnaireInfo(id,message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self._questionnaireUnitDatas = {}


    local questionnaires = rawget(message,"questionnaires") or {}
    for k,v in ipairs(questionnaires) do
        self:_addQuestionnaire(v)
    end

    --已经参与的文卷
    local questionIds = rawget(message,"question_ids") or {}
    for k,v in ipairs(questionIds) do
        local unitData = self:_getQuestionnaire(v)
        if unitData then
            unitData:setApply(true)
        end
    end

   G_SignalManager:dispatch(SignalConst.EVENT_QUESTIONNAIRE_INGO_CHANGE)
   G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_QUESTION)
end

function QuestionnaireData:_s2cUpdateQuestionnaireInfo(id,message)
 
    self:_addQuestionnaire(message.questionnaire)

    G_SignalManager:dispatch(SignalConst.EVENT_QUESTIONNAIRE_INGO_CHANGE)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_QUESTION)
end

function QuestionnaireData:_s2cQuestionnaire(id,message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    local unitData = self:_getQuestionnaire(self._sendedQidCache)
    if unitData then
        unitData:setApply(true)
    end
   -- self:_deleteQuestionnaire(self._sendedQidCache)
    G_SignalManager:dispatch(SignalConst.EVENT_QUESTIONNAIRE_INGO_CHANGE)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_QUESTION)
end

function QuestionnaireData:_addQuestionnaire(data)
    local questionnaireUnitData = QuestionnaireUnitData.new(data)
    self._questionnaireUnitDatas["k_"..tostring(questionnaireUnitData:getId())] = questionnaireUnitData 
end

function QuestionnaireData:_deleteQuestionnaire(id)
   self._questionnaireUnitDatas["k_"..tostring(id)] = nil
end

function QuestionnaireData:_getQuestionnaire(id)
   return self._questionnaireUnitDatas["k_"..tostring(id)]
end

function QuestionnaireData:c2sQuestionnaire(qid)
    self._sendedQidCache  = qid
    G_NetworkManager:send(MessageIDConst.ID_C2S_Questionnaire,  {qid = qid})
end

function QuestionnaireData:hasRedPoint()
    return true
end

function QuestionnaireData:getQuestionList()
    local queList = {}
    for k,v in pairs(self._questionnaireUnitDatas ) do 
        if v:canShow() then
            table.insert( queList,v )
        end
    end
    table.sort( queList, function(obj1,obj2)
        return obj1:getId() < obj2:getId()
    end)
    return queList
end


return QuestionnaireData