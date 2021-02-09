--超级Vip

local SvipConst = {}

--不同渠道索引对应不同的functionId
SvipConst.INDEX2FUNCTIONID = {
	[1] = FunctionConst.FUNC_SUPER_VIP,
	[2] = FunctionConst.FUNC_SUPER_VIP_2,
}

return readOnly(SvipConst)