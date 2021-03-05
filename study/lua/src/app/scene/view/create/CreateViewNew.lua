local ViewBase = require("app.ui.ViewBase")
local CreateViewNew = class("CreateViewNew", ViewBase)
local AudioConst = require("app.const.AudioConst")

local CSHelper = require("yoka.utils.CSHelper")

function CreateViewNew:ctor()
    self._selectIdx = 0
    self._defaultName = nil
    -- self._spineList = {
    --     "999_big",
    --     "998_big"
    -- } --两个主角的spine，预加载

    -- for _, id in pairs(self._spineList) do
    --     G_SpineManager:addSpineAsync(Path.getEffectSpine(id), 1, nil, self)
    -- end
    local resource = {
        file = Path.getCSB("CreateViewNew", "create"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _touchFemale = {
                events = {{event = "touch", method = "_onFemaleClick"}}
            },
            _touchMale = {
                events = {{event = "touch", method = "_onMaleClick"}}
            },
            _panelMale = {
                events = {{event = "touch", method = "_onMaleClick"}}
            },
            _panelFemale = {
                events = {{event = "touch", method = "_onFemaleClick"}}
            },
            _imageBack = {
                events = {{event = "touch", method = "_onBackClick"}}
            }
        }
    }
    CreateViewNew.super.ctor(self, resource, 9999)
end

function CreateViewNew:onEnter()
    self._panelChooseEffect:setVisible(false)
    self._imageBack:setVisible(false)
    self._imageTitle:setVisible(true)
end

function CreateViewNew:onExit()
end

function CreateViewNew:_onFemaleClick()
    if self._selectIdx == 2 then
        return
    end
    self._selectIdx = 2
    self:_refreshChooseBtn()
    self:_playChooseAnim()
end

function CreateViewNew:_onMaleClick()
    if self._selectIdx == 1 then
        return
    end
    self._selectIdx = 1
    self:_refreshChooseBtn()
    self:_playChooseAnim()
end

function CreateViewNew:_refreshChooseBtn()
    if self._selectIdx == 1 then
        self._imageMale:loadTexture(Path.getCreateImage("btn_create_male_sel"))
        self._imageFemale:loadTexture(Path.getCreateImage("btn_create_female_nml"))
    elseif self._selectIdx == 2 then
        self._imageMale:loadTexture(Path.getCreateImage("btn_create_male_nml"))
        self._imageFemale:loadTexture(Path.getCreateImage("btn_create_female_sel"))
    else
        self._imageMale:loadTexture(Path.getCreateImage("btn_create_male_nml"))
        self._imageFemale:loadTexture(Path.getCreateImage("btn_create_female_nml"))
    end
end

function CreateViewNew:_playChooseAnim()
    self._imageBack:setVisible(true)
    self._imageTitle:setVisible(false)
    self._panelChooseEffect:setVisible(true)
    if self._nodeInput then
        self._defaultName = self._nodeInput:getDefaultName()
        self._nodeInput = nil
    end
    self._nodeEffect:removeAllChildren()
    self._nodeUIEffect:removeAllChildren()

    local spineId = "999_big"
    local anim = "moving_nanzhuchuangjue_2"
    if self._selectIdx == 2 then
        spineId = "998_big"
        anim = "moving_nvzhuchuangjue_2"
    end
    local function eventFunction(event)
        if event == "ui" then
            self:_createUI()
        end
    end
    -- G_SpineManager:addSpineAsync(
    --     Path.getEffectSpine(spineId),
    --     1,
    --     function()
            G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, anim, nil, eventFunction)
    --     end,
    --     self
    -- )
end

function CreateViewNew:_createUI()
    local anim = "moving_chuangjueui_nanzhu"
    if self._selectIdx == 2 then
        anim = "moving_chuangjueui_nvzhu"
    end
    local function effectFunction(effect)
        if effect == "juese" then
            local id = 999
            if self._selectIdx == 2 then
                id = 998
            end
            local spineNode = require("yoka.node.SpineNode").new(0.5)
            spineNode:setAsset(Path.getSpine(id))
            spineNode:setAnimation("idle", true)
            return spineNode
        elseif effect == "shurukuang" then
            local node = CSHelper.loadResourceNode(Path.getCSB("NodeInput", "create"))
            self._nodeInput = require("app.scene.view.create.NodeInput").new(node, self._selectIdx, self._defaultName)
            return node
        elseif effect == "anniu" then
            local btn = ccui.Button:create()
            btn:loadTextureNormal(Path.getCreateImage("btn_create_startgame"))
            btn:addClickEventListenerEx(handler(self, self._onStartClick))
            return btn
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeUIEffect, anim, effectFunction)
end

function CreateViewNew:_returnMainView()
    if self._nodeInput then
        self._defaultName = self._nodeInput:getDefaultName()
    end
    self._panelChooseEffect:setVisible(false)
    self._selectIdx = 0
    self:_refreshChooseBtn()
    self._nodeEffect:removeAllChildren()
    self._nodeUIEffect:removeAllChildren()
    self._nodeInput = nil
    self._imageBack:setVisible(false)
    self._imageTitle:setVisible(true)
end

function CreateViewNew:_onBackClick()
    if self._selectIdx ~= 0 then
        self:_returnMainView()
    end
end

function CreateViewNew:_onStartClick()
    local nameTxt = self._nodeInput:getName()
    G_AudioManager:playSoundWithId(AudioConst.SOUND_BUTTON_START_GAME)
    nameTxt = string.trim(nameTxt)

    local TextHelper = require("app.utils.TextHelper")
    if TextHelper.isNameLegal(nameTxt, 2, 7) then
        G_GameAgent:checkContent(
            nameTxt,
            function()
                G_GameAgent:createRole(nameTxt, self._selectIdx)
            end
        )
    end
end

return CreateViewNew
