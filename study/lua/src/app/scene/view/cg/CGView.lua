local ViewBase = require("app.ui.ViewBase")
local CGView = class("CGView", ViewBase)

local VideoConst = require("app.const.VideoConst")
local AudioConst = require("app.const.AudioConst")

function CGView:ctor(path, isLogin)
    self._path = path
    self._videoPlayer = nil
    self._isLogin = isLogin

    local resource = {
        file = Path.getCSB("cgView", "cg"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _touchPanel = {
                events = {{event = "touch", method = "_onPanelClick"}}
            }
        }
    }
    CGView.super.ctor(self, resource)
end

function CGView:onCreate()
    self._videoPlayer = ccexp.VideoPlayer:create()
    local midPoint = G_ResolutionManager:getDesignCCPoint()
    self._videoPlayer:setAnchorPoint(cc.p(0.5, 0.5))
    local size = G_ResolutionManager:getDesignCCSize()
    self._videoPlayer:setContentSize(cc.size(1136, 640))
    self._videoPlayer:setKeepAspectRatioEnabled(true)
    self._videoPlayer:setFullScreenEnabled(false)
    self._nodeVideo:addChild(self._videoPlayer)
    self._videoPlayer:setFileName(self._path)
    self._videoPlayer:addEventListener(handler(self, self._onVideoEventCallback))
end

function CGView:onEnter()
    G_AudioManager:stopMusic()
    self._videoPlayer:play()    
      
end

function CGView:_onVideoEventCallback(sender, eventType)
    if eventType == ccexp.VideoPlayerEvent.PLAYING then
        --正在播放
        -- self:onVideoPlaying()
    elseif eventType == ccexp.VideoPlayerEvent.PAUSED then
        --暂停播放
        -- self:onVideoPause()
    elseif eventType == ccexp.VideoPlayerEvent.STOPPED then
        --停止播放
        -- self:onVideoStopped()
    elseif eventType == ccexp.VideoPlayerEvent.COMPLETED then
        --播放完成
        self:_onVideoFinished()
    end
end

function CGView:_onPanelClick()
    local Application = cc.Application:getInstance()
    local targetPlatform = Application:getTargetPlatform()
    local v = G_UserData:getUserSetting():getSettingValue("VideoVer")
    --if v and v == VideoConst.videoVer then --注释掉，这样玩家第一次也可跳过
        if targetPlatform == cc.PLATFORM_OS_IPHONE or targetPlatform == cc.PLATFORM_OS_IPAD then 
            if cc.FileUtils:getInstance():isFileExist("skip.png") then 
                self._videoPlayer:addSkipButton()  
            else 
                self._touchPanel:setTouchEnabled(false)
                self:_onVideoFinished()
            end
        elseif targetPlatform == cc.PLATFORM_OS_ANDROID then 
            self._touchPanel:setTouchEnabled(false)
            self:_onVideoFinished()
        end
    --end
end

function CGView:_onVideoFinished()
    G_UserData:getUserSetting():setSettingValue("VideoVer", VideoConst.videoVer)
    local SchedulerHelper = require ("app.utils.SchedulerHelper")
    SchedulerHelper.newScheduleOnce(function()
        self:_changeScene()
    end, 0.5)
end

function CGView:_changeScene()
    if not self._isLogin then
        G_SceneManager:showScene("login")
    else 
        self:removeFromParent()
        G_AudioManager:playMusicWithId(AudioConst.MUSIC_LOGIN_CREATE)
    end
end

return CGView
