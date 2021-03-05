
local RollNoticeTask = import(".RollNoticeTask")
local RollNoticeBaseNode = import(".RollNoticeBaseNode")
local RollNoticeService = class("RollNoticeService")
local RollNoticeConst = require("app.const.RollNoticeConst")
function RollNoticeService:ctor( ... )
	self._rootNode = nil
	self._typeFilterList = {
		["main"] = {},--主场景过滤的跑马灯类型
	}
	self._filterSceneList = {"create"}
	self._notRunSelfSceneList = {"drawCard","arena","fight"}
	-- 不接收 自己 的跑马灯
	self._notRecieveSelfIds = {
		RollNoticeConst.NOTICE_AVATAR_ACTIVITY_ID,
		RollNoticeConst.NOTICE_EQUIP_ACTIVITY_ID,
		RollNoticeConst.NOTICE_PET_ACTIVITY_ID,
		RollNoticeConst.NOTICE_CAMP_RACE_PRE_PASS,
		RollNoticeConst.NOTICE_CAMP_RACE_GUILD_PRE_PASS,
		RollNoticeConst.NOTICE_CAMP_RACE_ROUND_2,
		RollNoticeConst.NOTICE_CAMP_RACE_ROUND_3,
		RollNoticeConst.NOTICE_CAMP_RACE_ROUND_4,
		RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_2,
		RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_3,
		RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_4,
		RollNoticeConst.NOTICE_HORSE_CONQUER_ACTIVITY_ID,
	}

	self._sceneTaskList = {}
	self._taskList = nil
	self._rollMsgCache = {}--需要跑的消息队列
	self._currRollMsg = nil--当前跑的消息

	self:_registerEvents()
end

function RollNoticeService:_registerEvents()
	if not self._signalChangeScene then
		self._signalChangeScene = G_SignalManager:add(SignalConst.EVENT_CHANGE_SCENE, handler(self, self._onEventChangeScene))
	end

	if not self._signalRollNoticeReceive then
		self._signalRollNoticeReceive = G_SignalManager:add(SignalConst.EVENT_ROLLNOTICE_RECEIVE, handler(self, self._onEventRollNotice))
	end

	if not self._signalSubtitlesRunEnd then
		self._signalSubtitlesRunEnd = G_SignalManager:add(SignalConst.EVENT_SUBTITLES_RUN_END, handler(self, self._onEventSubtitlesRunEnd))
	end

	if not self._signalSubtitlesShowHide then
		self._signalSubtitlesShowHide = G_SignalManager:add(SignalConst.EVENT_SUBTITLES_SHOW_HIDE, handler(self, self._onEventSubtitlesShowHide))
	end
end

function RollNoticeService:_unRegisterEvents()
	if self._signalRollNoticeReceive then
		self._signalRollNoticeReceive:remove()
		self._signalRollNoticeReceive = nil
	end
	if self._signalChangeScene then
		self._signalChangeScene:remove()
		self._signalChangeScene = nil
	end

	if self._signalSubtitlesRunEnd then
		self._signalSubtitlesRunEnd:remove()
		self._signalSubtitlesRunEnd = nil
	end

	if self._signalSubtitlesShowHide then
		self._signalSubtitlesShowHide:remove()
		self._signalSubtitlesShowHide = nil
	end
end

function RollNoticeService:start()
	self:_registerEvents()
end

function RollNoticeService:startTask(sType)
	-- body
	self:_registerEvents()

	if self._taskList == nil then
		self._taskList = {}
	end

	if self._taskList["k_"..tostring(sType)] ~= nil then return end
	--关注的跑马灯类型
	local idList = self._typeFilterList[sType]
	idList = idList or {}
	--是否不跑自己的通知消息
	local notRunSelf = table.indexof(self._notRunSelfSceneList,sType)

	local task = RollNoticeTask.new(tostring(sType),idList,notRunSelf)

	self._taskList["k_"..tostring(sType)] = task
	task:start()
end

function RollNoticeService:stop(sType )
	if self._taskList == nil then return end
	local task = self._taskList["k_"..tostring(sType)]
	if task ~= nil then
		task:clear()
		self._taskList["k_"..tostring(sType)] = nil
	end
end


function RollNoticeService:_isMsgInNotRecieveSelfIdsList(rollMsg)
	local isSelf =  rollMsg.sendId and G_UserData:getBase():getId() == rollMsg.sendId --自己不用显示
	print( "___________________RollNoticeService:_isMsgInNotRecieveSelfIdsList", isSelf, rollMsg.noticeId )
	if isSelf and rollMsg.noticeId and table.indexof(self._notRecieveSelfIds,rollMsg.noticeId) ~= false then
		return true
	end
	return false
end

--收到通知消息
function RollNoticeService:_onEventRollNotice(event,rollMsg)
	if self._taskList == nil then return end
	logWarn("---------------------_onEventRollNotice")
	if rollMsg == nil or type(rollMsg) ~= "table" then return end
	if not rollMsg.msg or rollMsg.msg == "" then return end
	if self:_isMsgInNotRecieveSelfIdsList(rollMsg) then
		return
	end
	local canReceive = false
	for k,v in pairs(self._taskList) do
		if v:canReceiveNotice(rollMsg) then
			canReceive = true
			break
		end
	end

	if canReceive then
		logWarn("---------------------insert rollMsg")
		table.insert(self._rollMsgCache,rollMsg)
	end
	self:_runNextRollMsg()
end

function RollNoticeService:_onEventSubtitlesRunEnd(event,rollMsg,node)
	self._currRollMsg  = nil

	if #self._rollMsgCache <= 0 then
		G_SignalManager:dispatch(SignalConst.EVENT_SUBTITLES_SHOW_HIDE,false)
	else
		self:_runNextRollMsg()
	end
end

function RollNoticeService:_onEventSubtitlesShowHide(event,show)
	if show then
		self:show()
	else
		self:hide()
	end
end

function RollNoticeService:_popRollMsg()
	if #self._rollMsgCache > 0 then
		local msg = table.remove(self._rollMsgCache,1)
		return msg
	end
	return nil
end

function RollNoticeService:_runNextRollMsg()
	if self._currRollMsg then
		return
	end

	repeat
		local popMsg = self:_popRollMsg()
        local canRunMsg, runEffect = false, nil
		if popMsg then
			for k,v in pairs(self._taskList) do

				if v:canRunNotice(popMsg) then
                    canRunMsg = true
                    runEffect = v:isExistEffect(popMsg.noticeId)
					break
				end
			end
		end
		if canRunMsg then
			logWarn("---------------------canRunMsg")
			self:_runSubtitle(popMsg, runEffect)
		end
	until not popMsg or canRunMsg

	--弹出一个消息，但是不能Run，并且没有剩余消息了
	if not self._currRollMsg and #self._rollMsgCache <= 0 then
		logWarn("---------------------hide")
		G_SignalManager:dispatch(SignalConst.EVENT_SUBTITLES_SHOW_HIDE,false)
	end

end

function RollNoticeService:_onEventChangeScene(event,enter,sceneName)
	if enter then
		if table.indexof(self._filterSceneList,sceneName) == false then
			logWarn("RollNoticeService scene sign"..sceneName)
			self._sceneTaskList[sceneName] = true
			self:startTask(sceneName)
		else
			self:clearScene()
		end
	else
		if self._sceneTaskList[sceneName] then
			logWarn("RollNoticeService remove scene sign"..sceneName)
			self._sceneTaskList[sceneName] = nil
			self:stop(sceneName)
		end
	end

end

function RollNoticeService:_runSubtitle(rollMsg, effect)
	local runningScene = cc.Director:getInstance():getRunningScene()
	if runningScene == nil then return end

	if self._rootNode == nil then
		logWarn("---------------------create rootNode")
		self:_createRootNode()
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SUBTITLES_SHOW_HIDE,true)

    

	-- 创建弹幕显示用根节点
	local itemNode = RollNoticeBaseNode.new(rollMsg)
	self._rootNode._panelContent:addChild(itemNode)
	local size = self._rootNode._panelContent:getContentSize()
    itemNode:run(size)
    
    -- 特效
    self:_createEffectShandian(effect)
	self._currRollMsg = rollMsg

	logWarn("---------------------run")
end

function RollNoticeService:_createEffectShandian(efc)
    self._rootNode._nodeEffect:setVisible(false)
    if efc and efc ~= "" then
        self._rootNode._nodeEffect:setVisible(true)
        self._rootNode._nodeEffect:removeAllChildren()
        G_EffectGfxMgr:createPlayGfx(self._rootNode._nodeEffect, efc, nil, true)
    end
end

function RollNoticeService:clearScene( ... )
	G_SignalManager:dispatch(SignalConst.EVENT_SUBTITLES_SHOW_HIDE,false)
	if self._rootNode ~= nil then
		self._rootNode:removeFromParent(true)
		self._rootNode = nil
	end
	self._currRollMsg = nil
	self._rollMsgCache = {}
end

function RollNoticeService:_clearAllTask()
	if self._taskList == nil then return end
	for k,v in pairs(self._taskList) do
		v:clear()
		self._taskList[k] = nil
	end
end

function RollNoticeService:stopAllTaskAndClear( ... )
	self:_clearAllTask()
	self:clearScene()
end

function RollNoticeService:clear()
	self:stopAllTaskAndClear()
	self:_unRegisterEvents()

end

function RollNoticeService:pause( ... )

end

function RollNoticeService:resume( ... )
end

function RollNoticeService:show( ... )
	if self._rootNode ~= nil then
		self._rootNode:setVisible(true)
	end
end

function RollNoticeService:hide( ... )
	if self._rootNode ~= nil then
		self._rootNode:setVisible(false)
	end
end

function RollNoticeService:_createRootNode()
	if self._rootNode == nil then
		self._rootNode = display.newNode()
		local resource = {
			file = Path.getCSB("RollNoticeLayer", "rollnotice"),
			size = G_ResolutionManager:getDesignSize(),
			binding = {
			}
		}

		local CSHelper = require("yoka.utils.CSHelper")
		CSHelper.createResourceNode(self._rootNode,resource)
		G_TopLevelNode:addToSubtitleLayer(self._rootNode)

		self:hide()
	end
end

return RollNoticeService
