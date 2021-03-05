local SceneManager = class("SceneManager")
local scheduler = require("cocos.framework.scheduler")
--
local director = cc.Director:getInstance()

local MAX_CACHE_SCENE  = 1
--
function SceneManager:ctor()
	self._sceneStack = {}
    self._signalSceneMap = {}
    self._signalDialogMap = {}
    self._mainFrame = MAIN_FRAME_MAX
    self._newFrame = MAIN_FRAME_MAX
    self._lockSize = 0
end

--
function SceneManager:clear()

end


function SceneManager:requireDlg(name)

    local status, data = xpcall(function()
            return require(name)
        end, __G__TRACKBACK__)


    if status and data then
        return data
    end

    error(string.format("SceneManager:requireDlg() - not found dlg \"%s\"", name), 0)

    return nil
end

function SceneManager:requireView(name)
    local sceneInitData = string.format("app.scene.view.%s.init", name)
    local status, data = xpcall(function()
            return require(sceneInitData)
        end, __G__TRACKBACK__)


    if status and data then
        return data
    end

    error(string.format("SceneManager:requireView() - not found view \"%s\"", name), 0)

    return nil
end
--
function SceneManager:createView(name, ...)
    local data = self:requireView(name)
    if data then
        if data.frame then
            self._newFrame = data.frame
            -- self._newFrame = data.frame <= MAIN_FRAME_MAX and data.frame or MAIN_FRAME_MAX
        else
            self._newFrame = MAIN_FRAME_MAX
        end
        local t = type(data.view)
        if (t == "table" or t == "userdata") then
            return data.view:create(...)
        end
    end

    error(string.format("SceneManager:createView() - not found view \"%s\"", name), 0)
end

--
function SceneManager:createScene(name, ...)
    local view = self:createView(name, ...)
    local scene = require("app.scene.GameScene").new(name, view)
    scene:onNodeEvent("enter", function ()

    end)

    scene:onNodeEvent("exit", function ()

    end)

    scene:onNodeEvent("cleanup", function ()
        self:_delayClearCache(0.5)
    end)
    return scene, view
end


function SceneManager:_createView(name, ...)
    local scene, view = self:createScene(name, ...)
    if name == "logo" or name == "login" or name == "create" or name == "main" then
        logWarn("SceneManager:_createView(name, ...) ..  "..name)
        self:popToRootScene()
        self:replaceScene(scene)
    else
        local root = self:getRootScene()
        if root then
            local rootName = root:getName()
            if rootName == "logo" or rootName == "login" or rootName == "create" then
                logWarn("SceneManager:_createView(name, ...) ..  "..rootName)
                self:popToRootScene()
                self:replaceScene(scene)
                return
            end
        end

        self:pushScene(scene)
    end

    if self._newFrame ~= self._mainFrame then
        self._mainFrame = self._newFrame
        cc.Director:getInstance():setAnimationInterval(1/self._mainFrame)
    end
end

--服务器返回错误消息时，清理信号
function SceneManager:clearWaitEnterSignal()
    self:_clearDialogSignal()
    self:_clearSceneSignal()
end

--清理场景加载的信号
function SceneManager:_clearSceneSignal()
    for i, value in pairs(self._signalSceneMap) do
        if value then
            value:remove()
        end
    end
    self._signalSceneMap = {}
end

--清理场景加载的信号
function SceneManager:_clearDialogSignal()
    for i, value in pairs(self._signalDialogMap) do
        if value then
            value:remove()
        end
    end
    self._signalDialogMap = {}
end

function SceneManager:popToRootAndReplaceScene(sceneName, ...)
    self._packSceneParam = {...}
    self:_clearSceneSignal()
    local viewLua = self:requireView(sceneName)
    if viewLua and viewLua.view.waitEnterMsg then
        --这里做了点hark
        --需要等待事件，例如网络数据， 当收到网络数据时，才会走创建流程
        local function createViewCallBack()
            logWarn("SceneManager:createViewCallBack  "..sceneName)
            --移除监听事件
            if self._signalSceneMap[sceneName] ~= nil then
                local signal = self._signalSceneMap[sceneName]
                signal:remove()
                self._signalSceneMap[sceneName] = nil
            end
            local scene, view = G_SceneManager:createScene(sceneName,unpack(self._packSceneParam))
            G_SceneManager:popToRootScene()
            G_SceneManager:replaceScene(scene)
        end

        local signal = viewLua.view.waitEnterMsg(viewLua,createViewCallBack)
        self._signalSceneMap[sceneName] = signal
    end
end
--
function SceneManager:showScene(name, ...)
    --防止相同的scene重复弹出
    --if self:getRunningScene() and self:getRunningSceneName() == name then
    --    return
    --end

    crashPrint("SceneManager:showScene: " .. name)
	logNewT("SceneManager:showScene: " .. name)
    self._packSceneParam = {...}

    --清理
    self:_clearSceneSignal()
    local viewLua = self:requireView(name)
    if viewLua and viewLua.view.waitEnterMsg then
        --这里做了点hark
        --需要等待事件，例如网络数据， 当收到网络数据时，才会走创建流程
        local function createViewCallBack()
            logWarn("SceneManager:createViewCallBack  "..name)
            --移除监听事件
            if self._signalSceneMap[name] ~= nil then
                local signal = self._signalSceneMap[name]
                signal:remove()
                self._signalSceneMap[name] = nil
            end
            self:_createView(name, unpack(self._packSceneParam))
        end

        local signal = viewLua.view.waitEnterMsg(viewLua,createViewCallBack, self._packSceneParam)
        self._signalSceneMap[name] = signal
    end
end

function SceneManager:replaceCurrentScene(name, ...)
        --防止相同的scene重复弹出
    --if self:getRunningScene() and self:getRunningSceneName() == name then
    --    return
    --end

    crashPrint("SceneManager:showScene: " .. name)
	logNewT("SceneManager:showScene: " .. name)
    self._packSceneParam = {...}

        --清理
        self:_clearSceneSignal()
        local viewLua = self:requireView(name)
        if viewLua and viewLua.view.waitEnterMsg then
            --这里做了点hark
            --需要等待事件，例如网络数据， 当收到网络数据时，才会走创建流程
            local function createViewCallBack()
                logWarn("SceneManager:createViewCallBack  "..name)
                --移除监听事件
                if self._signalSceneMap[name] ~= nil then
                    local signal = self._signalSceneMap[name]
                    signal:remove()
                    self._signalSceneMap[name] = nil
                end

                local scene, view = self:createScene(name, unpack(self._packSceneParam))
                self:replaceScene(scene)
            
                if self._newFrame ~= self._mainFrame then
                    self._mainFrame = self._newFrame
                    cc.Director:getInstance():setAnimationInterval(1/self._mainFrame)
                end
            end
    
            local signal = viewLua.view.waitEnterMsg(viewLua,createViewCallBack, self._packSceneParam)
            self._signalSceneMap[name] = signal
        end
end

--弹出对话框,增加一个弹出框，发送消息的参数
function SceneManager:showDialog(name, callBack, msgParam, ...)
    crashPrint("SceneManager:createDialog: " .. name)

    self._packDlgParam = {...}
    self:_clearDialogSignal()
    --这里做了点hark
    --需要等待事件，例如网络数据， 当收到网络数据时，才会走创建流程
    local viewLua = self:requireDlg(name)

    if viewLua and viewLua.waitEnterMsg then
        local function createDlgCallBack()
            logWarn("SceneManager:createDlgCallBack  "..name)
            --移除监听事件
            if self._signalDialogMap[name] ~= nil then
                local signal = self._signalDialogMap[name]
                signal:remove()
                self._signalDialogMap[name] = nil
            end

            local dlg = viewLua.new(unpack(self._packDlgParam))
            dlg:openWithAction()
            if callBack and type(callBack) == "function" then
                callBack(dlg)
            end
			return dlg
        end
        local signal = viewLua.waitEnterMsg(viewLua,createDlgCallBack, msgParam)
        self._signalDialogMap[name] = signal
    end
end


--
function SceneManager:popToRootScene()
    crashPrint("SceneManager:popToRootScene")
    if #self._sceneStack > 1 then
        local scene = self._sceneStack[1]
        self._sceneStack = {}
        self._sceneStack[#self._sceneStack + 1] = scene
        director:popToRootScene()
    end
end

--
function SceneManager:replaceScene(scene)
    crashPrint("SceneManager:replaceScene: " .. scene:getName())
    table.remove(self._sceneStack, #self._sceneStack)
    self._sceneStack[#self._sceneStack + 1] = scene
    director:replaceScene(scene)
end

--
function SceneManager:pushScene(scene)
    crashPrint("SceneManager:pushScene: " .. scene:getName())
    -- 如果将要切入演武场景 需要把邀请框屏蔽
    if scene:getName() == "fight"  or scene:getName() == "qinTomb" or scene:getName() == "seasonSport" or
		scene:getName() == "seasonCompetitive" or scene:getName() == "groups" then
        G_SignalManager:dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE)
    end

    local function filterScene(sceneName)
        if sceneName == "fight" or sceneName == "exploreMap" then
            return true
        end
        return false
    end

    --每次push的时候，检测是否有lock
    --假设当前lockSize等于 sceneStack size，则用replaceScene接口，
    --使得scene大小不增长, 仅适用于非战斗场景
    if filterScene( scene:getName() ) == false then
        if  self._lockSize > 0 and self._lockSize == #self._sceneStack then
            logWarn("SceneManager:lockSize replaceScene")
            self:replaceScene(scene)
            return
        end
    end


    --检测该堆栈中是否有ItemGuilder
    self:lockScene()

    self._sceneStack[#self._sceneStack + 1] = scene

    director:pushScene(scene)
end

--指定场景弹出次数
function SceneManager:popSceneByTimes(times)
    times = times or 1
	local size = table.nums(self._sceneStack)
	times = math.min(times, size)

	for i=1, times do
        local scene = table.remove(self._sceneStack, #self._sceneStack)
        self:unlockScene(scene) --尝试解锁
        --scene:release()
	end

	if times > 0 then
		--assert(sceneSum - popSceneNum > 0, "popToSceneStackLevel == 0? level is 0, it will end the director")
		director:popToSceneStackLevel(size - times)
	end
end
--
function SceneManager:popScene()
    crashPrint("SceneManager:popScene")
    dump(self._sceneStack)
    if #self._sceneStack > 1 then
        local scene = table.remove(self._sceneStack, #self._sceneStack)
        crashPrint("SceneManager:popScene: "..scene:getName())
        director:popScene()
        self:unlockScene(scene)
        logWarn("director:popScene()")
        return true
    end

    local function backToMain()
        --如果在登陆界面，则不做返回到主界面操作
        local scene = self:getTopScene()
        if scene and scene:getName() == "login" then
            return
        end

        crashPrint("SceneManager:popScene back to main Scene")
        local scene, view = G_SceneManager:createScene("main")
        G_SceneManager:popToRootScene()
        G_SceneManager:replaceScene(scene)
    end
    --hard code
    --如果没有场景弹出了，则回到主界面。。
    --用于新手引导返回时，可能会用到
    backToMain()

    return false
end

function SceneManager:backToMain()
    local scene, view = G_SceneManager:createScene("main")
    G_SceneManager:popToRootScene()
    G_SceneManager:replaceScene(scene)
end

function SceneManager:fightScenePop()
    if #self._sceneStack > 1 then
        crashPrint("fightScenePop:fightScenePop")
        self:popScene()
    end
    --G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"FightView Finish")
end
--
function SceneManager:getRootScene()
    if #self._sceneStack > 1 then
        return self._sceneStack[1]
    end

    return nil
end

function SceneManager:getTopScene()
    return self._sceneStack[#self._sceneStack]
end

--
function SceneManager:getRunningScene()
    return director:getRunningScene()
end

--
function SceneManager:getRunningSceneName()
    local scene = director:getRunningScene()
    return scene:getName()
end

--
function SceneManager:_delayClearCache(t)
    scheduler.performWithDelayGlobal(function()
        self:clearCache()
    end, t)
end
--
function SceneManager:clearCache()
    --cc.CSLoader:getInstance():removeCacheReaders()
    sp.SpineCache:getInstance():removeUnusedSpines()

   --这里延迟清理会有问题， 导致新手引导的小手图片会丢失
   -- cc.SpriteFrameCache:getInstance():removeUnusedSpriteFrames()

    cc.Director:getInstance():getTextureCache():removeUnusedTextures()

    collectgarbage("collect")
end


--锁定场景
--检测该堆栈中是否有ItemGuilder
--当场景锁定时，将会设定一个最大size，超过该size的push，old会被剔除
function SceneManager:lockScene()
    -- body

    local scene = self._sceneStack[#self._sceneStack]

    if self._lockSize > 0 then
        return false
    end

    local function findItemGuilder(scene)
        local widget = ccui.Helper:seekNodeByName(scene, "PopupItemGuider")
        return widget
    end

    local widget = findItemGuilder(scene)
    if widget == nil then
        return false
    end

    self._lockSize = #self._sceneStack + MAX_CACHE_SCENE --  ItemGuiderScene之后，最大缓存场景数量
    logWarn("SceneManager:lockScene currSize: "..self._lockSize)

end

--每弹出一个scene的时候，做检查是否有PopupItemGuider
function SceneManager:unlockScene( scene )

    if self._lockSize == 0 then
        return
    end

    local scene = self._sceneStack[#self._sceneStack]
    local function findItemGuilder(scene)
        local widget = ccui.Helper:seekNodeByName(scene, "PopupItemGuider")
        return widget
    end

    local widget = findItemGuilder(scene)
    if widget == nil then
        return
    end

    --当拥有ItemGuider时
    if self._lockSize == #self._sceneStack + MAX_CACHE_SCENE then
        self._lockSize = 0
        logWarn("SceneManager:unlockScene")
    end
end

function SceneManager:registerGetReport(reportId, callBack)
    G_SignalManager:addOnce(SignalConst.EVENT_ENTER_FIGHT_SCENE, callBack)
    G_UserData:getFightReport():c2sGetNormalBattleReport(reportId)
end

return SceneManager
