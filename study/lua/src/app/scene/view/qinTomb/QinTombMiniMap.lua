--秦皇陵迷你小地图
local ViewBase = require("app.ui.ViewBase")
local QinTombMiniMap = class("QinTombMiniMap", ViewBase)
local PopupQinTombSmallMap = import(".PopupQinTombSmallMap")
local Path = require("app.utils.Path")
local QinTombHelper = import(".QinTombHelper")
local QinTombConst = require("app.const.QinTombConst")
local UIHelper = require("yoka.utils.UIHelper")

function QinTombMiniMap:ctor()
	self._scrollView = nil	--底图
	self._topBar = nil		--顶部条
	self._smallMapDlg = nil

	local resource = {
		file = Path.getCSB("QinTombMiniMap", "qinTomb"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {

		}
	}
	self:setName("QinTombMiniMap")
	QinTombMiniMap.super.ctor(self, resource)
end

function QinTombMiniMap:onCreate()
	self._panelBk:addClickEventListenerEx(handler(self, self._onClickButton))
end


function QinTombMiniMap:updateEffect( ... )
	-- body
	local selfTeamUnit = G_UserData:getQinTomb():getSelfTeam()
	if selfTeamUnit and selfTeamUnit:isSelfTeamLead() then
		if G_UserData:getQinTomb():isShowEffect() == false then
			self:_playEffect()
		end
	end
end

function QinTombMiniMap:_playEffect( ... )
	-- body
	self._effectNode:removeAllChildren()
	local function effectFunction(effect)
        if effect == "txt" then
            local textWidget = UIHelper.createLabel(
				{ 
				 text = Lang.get("qin_tomb_minimap_tips"), 
				 fontSize = 20, 
				 color = cc.c3b(0x8a,0xff,0x00),--这里的美术字颜色比较特殊
				 outlineColor = cc.c4b(0x17, 0x56, 0x01, 0xff),
				}
			)
			return textWidget
        end
    end

	local function eventFunction(event)
		
    end

	G_EffectGfxMgr:createPlayMovingGfx(self._effectNode, "moving_xianqinhuangling_xiaoditutishi", effectFunction, eventFunction)
	
end

function QinTombMiniMap:_removeEffect( ... )
	-- body
	self._effectNode:removeAllChildren()
	G_UserData:getQinTomb():setShowEffect()
end

function QinTombMiniMap:_onClickButton( sender )
	if self._smallMapDlg == nil then
		local dlg = PopupQinTombSmallMap.new()
		self._smallMapDlg = dlg
		self._smallMapDlgSignal = self._smallMapDlg.signal:add(handler(self, self._onPopupSmallMapDlgClose))
		self:_removeEffect()
		
		dlg:open()
	end
end


--dlg框关闭事件
function QinTombMiniMap:_onPopupSmallMapDlgClose(event)
    if event == "close" then
        self._smallMapDlg = nil
		if self._smallMapDlgSignal then
			self._smallMapDlgSignal:remove()
			self._smallMapDlgSignal = nil
		end
    end
end

function QinTombMiniMap:onEnter()
	self:updateEffect()
end

function QinTombMiniMap:onExit()

end

--刷新迷你地图
function QinTombMiniMap:updateCamera( cameraX, cameraY )
	-- body
	local innerContainer = self._scrollView:getInnerContainer() 
	innerContainer:setPosition(cameraX, cameraY)
end

function QinTombMiniMap:convertToSmallMapPos( pos )
	-- body
	pos.x = pos.x *QinTombConst.CAMERA_SCALE_MIN
	pos.y = pos.y *QinTombConst.CAMERA_SCALE_MIN
	return pos
end

function QinTombMiniMap:updateSelf( selfPosX, selfPosY , monsterKey )
	-- body
	QinTombHelper.updateSelfNode(self._scrollView, selfPosX, selfPosY)
	QinTombHelper.updateTargetNode(self._scrollView)
	QinTombHelper.updateMiniMapAttackTeam(self._scrollView, monsterKey)
	QinTombHelper.updateMiniMapMonsterFight(self._scrollView)
	if self._smallMapDlg then
		self._smallMapDlg:updateSelf(selfPosX, selfPosY, monsterKey)
	end
end

return QinTombMiniMap
