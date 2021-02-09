local BillBoard =
    class(
    "BillBoard",
    function()
        return cc.Node:create()
    end
)

local Color = require("app.utils.Color")
local UIHelper = require("yoka.utils.UIHelper")
local HeroSkillEffect = require("app.config.hero_skill_effect")
local Path = require("app.utils.Path")
local FightConfig = require("app.fight.Config")
local EffectActor = require("app.fight.views.EffectActor")
local SchedulerHelper = require("app.utils.SchedulerHelper")

function BillBoard:ctor(name, quality, rankLevel, isPlayer, officelLevel, showMark, camp, maxHp, trueQuality)
    self:setCascadeOpacityEnabled(true)
    self:setCascadeColorEnabled(true)

    --血条黑低
    local panelHpBase = cc.Sprite:create(Path.getBattleRes("img_battle_hpbg"))
    self:addChild(panelHpBase)
    panelHpBase:setPosition(cc.p(0, 5))
    self._panelHpBase = panelHpBase

    --血条红底
    -- self._hpShadow = cc.Sprite:create(Path.getBattleRes('img_battle_hpshadow'))
    -- panelHpBase:addChild(self._hpShadow)
    -- self._hpShadow:setAnchorPoint(cc.p(0, 0))
    -- self._hpShadow:setPosition(cc.p(1, 2))
    self._hpShadow = ccui.LoadingBar:create(Path.getBattleRes("img_battle_hpshadow"), 100)
    panelHpBase:addChild(self._hpShadow)
    self._hpShadow:setAnchorPoint(cc.p(0, 0))
    self._hpShadow:setPosition(cc.p(1, 2))

    --白色护盾
    -- self._protect = ccui.LoadingBar:create(Path.getBattleRes("img_battle_es"), 0)
    -- panelHpBase:addChild(self._protect)
    -- self._protect:setAnchorPoint(cc.p(0, 0))
    -- self._protect:setPosition(cc.p(1, 2))
    -- self._protect:setPercent(0)

    self._protect = {}

    --绿色血条
    self._hp = ccui.LoadingBar:create(Path.getBattleRes("img_battle_hp"), 100)
    panelHpBase:addChild(self._hp)
    self._hp:setAnchorPoint(cc.p(0, 0))
    self._hp:setPosition(cc.p(1, 2))

    local angerBase = cc.Sprite:create(Path.getBattleRes("img_battle_bar_angebg"))
    self:addChild(angerBase)
    angerBase:setPosition(cc.p(0, -2))

    self._imageAnger = {}
    for i = 1, 4 do
        self._imageAnger[i] = cc.Sprite:create(Path.getBattleRes("img_battle_bar_ange0" .. i))
        self._imageAnger[i]:setPosition(cc.p(10 + (i - 1) * 16, 4))
        angerBase:addChild(self._imageAnger[i])
    end

    self._angerCountBG = cc.Sprite:create(Path.getBattleRes("img_battle_angenumbg"))
    self:addChild(self._angerCountBG)
    self._angerCountBG:setPosition(cc.p(50, 3))

    self._angerLabel = cc.Label:createWithCharMap(Path.getBattleFont("img_battle_angenum"), 20, 18, string.byte("+"))
    self._angerCountBG:addChild(self._angerLabel)
    self._angerLabel:setString("9")
    self._angerLabel:setAnchorPoint(cc.p(0, 0.5))
    self._angerLabel:setPosition(cc.p(20, 10))

    if rankLevel ~= 0 then
        if trueQuality == 7 and not isPlayer then -- 金将、
            name = name .. " " .. Lang.get("goldenhero_train_text") .. rankLevel
        else
            name = name .. "+" .. rankLevel
        end
    end
    local labelName = cc.Label:createWithTTF(name, Path.getCommonFont(), 22)
    self:addChild(labelName)
    labelName:setPosition(cc.p(0, 22))
    if isPlayer then
        labelName:setColor(Color.getOfficialColor(officelLevel))
        labelName:enableOutline(Color.getOfficialColorOutline(officelLevel), 2)
    else
        labelName:setColor(Color.getColor(quality))
        labelName:enableOutline(Color.getColorOutline(quality), 2)
    end

    if officelLevel and officelLevel ~= 0 and isPlayer then
        local officalInfo, officalLevel = G_UserData:getBase():getOfficialInfo(officelLevel)
        local labelOfficalName = cc.Label:createWithTTF("[" .. officalInfo.name .. "]", Path.getCommonFont(), 22)
        self:addChild(labelOfficalName)
        labelOfficalName:setPosition(cc.p(0, 45))
        labelOfficalName:setColor(Color.getOfficialColor(officalLevel))
        labelOfficalName:enableOutline(Color.getOfficialColorOutline(officalLevel), 2)
    end

    local markStartPosX = labelName:getContentSize().width / 2
    self:_createMarks(showMark, camp)

    self._buffIcons = {}
    for i = 1, 4 do
        local params = {}
        self._buffIcons[i] = UIHelper.createImage(params)
        self._buffIcons[i]:setAnchorPoint(cc.p(0, 0))
        self._buffIcons[i]:setPosition(cc.p(-40 + 20 * (i - 1), -28))
        self._buffIcons[i]:setScale(0.5)
        self:addChild(self._buffIcons[i])
        self._buffIcons[i]:setVisible(false)
    end

    self._maxHp = maxHp --最大血量
    self._hpPercent = 100 --目标百分比
    self._shadowPercent = 100 --背景红色的百分比
    self._angerEffect = nil
    self:setVisible(false)
end

function BillBoard:_createNewProtect()
    local protect = ccui.LoadingBar:create(Path.getBattleRes("img_battle_es"), 0)
    self._panelHpBase:addChild(protect)
    protect:setAnchorPoint(cc.p(0, 0))
    protect:setPosition(cc.p(1, 2))
    protect:setPercent(0)
    table.insert(self._protect, protect)
    protect:setLocalZOrder(#self._protect)
end

function BillBoard:_createMarks(showMark, camp)
    for i, v in pairs(showMark) do
        local effect = EffectActor.new(FightConfig.MARK[v])
        effect:setAction("effect", true)
        self:addChild(effect)
        -- effect:setScale(1.3)
        effect:setPositionY(-15)
        if camp == 2 then
            effect:setScaleX(-1)
        end
    end
end

--更新绿色的血条
function BillBoard:updateHP(hp, protect)
    local hpPercent = hp / self._maxHp * 100
    if hpPercent > 100 then
        hpPercent = 100
    end
    self._shadowPercent = hpPercent
    self._hp:setPercent(hpPercent)

    if protect ~= 0 then
        local protectCnt = math.ceil(protect / self._maxHp)
        if protectCnt ~= 0 then
            while not self._protect[protectCnt] do
                self:_createNewProtect()
            end
            for i = 1, protectCnt - 1 do
                self._protect[i]:setPercent(100)
            end
            if protectCnt < #self._protect then 
                for i = #self._protect, protectCnt + 1, -1  do 
                    self._protect[i]:removeFromParent()
                    table.remove(self._protect, i)
                end
            end
            local lastProtect = protect - (protectCnt - 1) * self._maxHp
            local protectPercent = lastProtect / self._maxHp * 100
            self._protect[#self._protect]:setPercent(protectPercent)
        end
    else 
        for i, v in pairs(self._protect) do 
            v:removeFromParent()
        end
        self._protect = {}
    end

    -- if protect == 0 then
    --     self._protect:setVisible(false)
    -- else
    --     self._protect:setVisible(true)
    -- end
    -- local percent = (hp + protect) / self._maxHp * 100
    -- if percent > 100 then
    --     self._shadowPercent = 100
    --     local hpPercent = hp / (hp + protect) * 100
    --     self._hp:setPercent(hpPercent)
    --     if protect == 0 then
    --         self._protect:setVisible(false)
    --     else
    --         self._protect:setVisible(true)
    --         self._protect:setPercent(100)
    --     end
    -- else
    --     local protectPercent = (protect + hp )/ self._maxHp * 100
    --     if protectPercent > 100 then
    --         protectPercent = 100
    --     end
    --     self._shadowPercent = protectPercent
    --     self._protect:setPercent(protectPercent)
    --     local hpPercent = hp / self._maxHp * 100
    --     if hpPercent > 100 then
    --         hpPercent = 100
    --     end
    --     self._hp:setPercent(hpPercent)
    -- end
end

--更新底下的血条
function BillBoard:updateHpShadow(needScaleMoving)
    if needScaleMoving then
        local action1 = cc.FadeOut:create(0.2)
        local action2 =
            cc.CallFunc:create(
            function()
                self._hpShadow:setPercent(self._shadowPercent)
                self._hpShadow:setOpacity(255)
            end
        )
        local action = cc.Sequence:create(action1, action2)
        self._hpShadow:runAction(action)
    else
        self._hpShadow:setPercent(self._shadowPercent)
    end
end

--update
function BillBoard:update(f)
end

function BillBoard:showDead()
    local action1 = cc.FadeOut:create(0.2)
    local action2 = cc.RemoveSelf:create()
    local action = cc.Sequence:create(action1, action2)
    self:runAction(action)
end

function BillBoard:updateAnger(count)
    for i = 1, 4 do
        if i <= count then
            self._imageAnger[i]:setVisible(true)
        else
            self._imageAnger[i]:setVisible(false)
        end
    end

    if count > 4 then
        self._angerLabel:setString(count)
        self._angerCountBG:setVisible(true)
    else
        self._angerCountBG:setVisible(false)
    end

    if count >= 4 then
        self:_playAngerEffect()
    else
        self:_hideAngerEffect()
    end
end

function BillBoard:updateBuff(bufflist, camp)
    for i = 1, 4 do
        self._buffIcons[i]:setVisible(false)
    end
    local buffPos = 1
    if #bufflist > 4 then
        for i = #bufflist - 3, #bufflist do
            local data = HeroSkillEffect.get(bufflist[i].configId)
            if data.buff_icon ~= "" then
                local picName = Path.getBuffFightIcon(data.buff_icon)
                self._buffIcons[buffPos]:loadTexture(picName)
                self._buffIcons[buffPos]:setVisible(true)
                buffPos = buffPos + 1
            end
        end
    else
        for i = 1, #bufflist do
            local data = HeroSkillEffect.get(bufflist[i].configId)
            assert(data, "wrong skill id " .. bufflist[i].configId)
            if data.buff_icon ~= "" then
                local picName = Path.getBuffFightIcon(data.buff_icon)
                self._buffIcons[buffPos]:loadTexture(picName)
                self._buffIcons[buffPos]:setVisible(true)
                buffPos = buffPos + 1
            end
        end
    end
end

function BillBoard:_playAngerEffect()
    if not self._angerEffect then
        local EffectGfxNode = require("app.effect.EffectGfxNode")
        local function effectFunction(effect)
            if effect == "effect_nuqi_huoyan_1" or effect == "effect_nuqi_huoyan_4" then
                local subEffect = EffectGfxNode.new("effect_nuqi_huoyan")
                subEffect:play()
                return subEffect
            elseif string.find(effect, "effect_") then
                local subEffect = EffectGfxNode.new(effect)
                subEffect:play()
                return subEffect
            end
        end
        self._angerEffect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_nuqi", effectFunction, nil, false)
    end
    self._angerEffect:setVisible(true)
end

function BillBoard:_hideAngerEffect()
    if self._angerEffect then
        self._angerEffect:setVisible(false)
    end
end

return BillBoard
