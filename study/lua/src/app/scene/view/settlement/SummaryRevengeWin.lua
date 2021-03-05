local SummaryBase = require("app.scene.view.settlement.SummaryBase")
local SummaryRevengeWin = class("SummaryRevengeWin", SummaryBase)

local ComponentLine = require("app.scene.view.settlement.ComponentLine")
local ComponentDamage = require("app.scene.view.settlement.ComponentDamage")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local DropHelper = require("app.utils.DropHelper")

function SummaryRevengeWin:ctor(battleData, callback)

    local list = {}

    local size = G_ResolutionManager:getDesignCCSize()
    local width = size.width
    local height = size.height

    local midXPos = SummaryBase.NORMAL_FIX_X

	local componentLine = ComponentLine.new("txt_sys_reward02", cc.p(midXPos, 253 - height*0.5))
	table.insert(list, componentLine)

	local EnemyHelper = require("app.scene.view.friend.EnemyHelper")
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local UIHelper = require("yoka.utils.UIHelper")
	local TextHelper = require("app.utils.TextHelper")
	local  award = battleData.awards[1]
	local content = ""
	if award and  award.size then
		-- local itemParams = TypeConvertHelper.convert(award.type, award.value, award.size)
		-- local name = TextHelper.expandTextByLen(itemParams.name, 3)
	    -- assert(itemParams ~= nil, string.format("TypeConvertHelper.convert fail type = %s value = %s ", award.type or "nil", award.value or "nil"))
		if award.size >= EnemyHelper.getFightSuccessEnergy() then
			content = Lang.get("lang_friend_enemy_revenge_win2", {num1 = EnemyHelper.getFightWinVaule(), num2 = award.size})
		else
			content = Lang.get("lang_friend_enemy_revenge_win1", {num1 = EnemyHelper.getFightWinVaule(), num2 = award.size})
		end
	else
		content = Lang.get("lang_friend_enemy_revenge_win0", {num1 = EnemyHelper.getFightWinVaule()})

	end
	local componentDamage = ComponentDamage.new(nil, cc.p(midXPos, 170 - height*0.5), content, {
		defaultColor = Colors.DARK_BG_ONE,
		fontSize = 22,
		YGap = 15,
		alignment = 2
	})
	table.insert(list, componentDamage)

    SummaryRevengeWin.super.ctor(self,battleData, callback, list, midXPos, true)
end

function SummaryRevengeWin:onEnter()
    SummaryRevengeWin.super.onEnter(self)
    self:_createAnimation()
end

function SummaryRevengeWin:onExit()
    SummaryRevengeWin.super.onExit(self)
end

function SummaryRevengeWin:_createAnimation()
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_allwin_win", handler(self, self._playWinText), handler(self, self.checkStart) , false )
end

return SummaryRevengeWin
