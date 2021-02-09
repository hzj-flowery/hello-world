-- ======================================================================
-- Copyright (c) 2012 RapidFire Studio Limited 
-- All Rights Reserved. 
-- http://www.rapidfirestudio.com

-- Permission is hereby granted, free of charge, to any person obtaining
-- a copy of this software and associated documentation files (the
-- "Software"), to deal in the Software without restriction, including
-- without limitation the rights to use, copy, modify, merge, publish,
-- distribute, sublicense, and/or sell copies of the Software, and to
-- permit persons to whom the Software is furnished to do so, subject to
-- the following conditions:

-- The above copyright notice and this permission notice shall be
-- included in all copies or substantial portions of the Software.

-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
-- EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
-- MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
-- IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
-- CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
-- TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
-- SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-- ======================================================================

--module ( "astar", package.seeall )
local AStar = {}

----------------------------------------------------------------
-- local variables
----------------------------------------------------------------

local INF = 1/0
local cachedPaths = nil

----------------------------------------------------------------
-- local functions
----------------------------------------------------------------

function AStar.dist ( x1, y1, x2, y2 )
	
	return math.sqrt ( math.pow ( x2 - x1, 2 ) + math.pow ( y2 - y1, 2 ) )
end

function AStar.dist_between ( nodeA, nodeB )

	return AStar.dist ( nodeA.x, nodeA.y, nodeB.x, nodeB.y )
end

function AStar.heuristic_cost_estimate ( nodeA, nodeB )

	return AStar.dist ( nodeA.x, nodeA.y, nodeB.x, nodeB.y )
end

function AStar.is_valid_node ( node, neighbor )

	return true
end

function AStar.lowest_f_score ( set, f_score )

	local lowest, bestNode = INF, nil
	for _, node in ipairs ( set ) do
		local score = f_score [ node ]
		if score < lowest then
			lowest, bestNode = score, node
		end
	end
	return bestNode
end

function AStar.neighbor_nodes ( theNode, nodes )

	local neighbors = {}
	for _, node in ipairs ( nodes ) do
		if theNode ~= node and AStar.is_valid_node ( theNode, node ) then
			table.insert ( neighbors, node )
		end
	end
	return neighbors
end

function AStar.not_in ( set, theNode )

	for _, node in ipairs ( set ) do
		if node == theNode then return false end
	end
	return true
end

function AStar.remove_node ( set, theNode )

	for i, node in ipairs ( set ) do
		if node == theNode then 
			set [ i ] = set [ #set ]
			set [ #set ] = nil
			break
		end
	end	
end

function AStar.unwind_path ( flat_path, map, current_node )

	if map [ current_node ] then
		table.insert ( flat_path, 1, map [ current_node ] ) 
		return AStar.unwind_path ( flat_path, map, map [ current_node ] )
	else
		return flat_path
	end
end

----------------------------------------------------------------
-- pathfinding functions
----------------------------------------------------------------

function AStar.a_star ( start, goal, nodes, valid_node_func )

	local closedset = {}
	local openset = { start }
	local came_from = {}
    if valid_node_func then
        AStar.is_valid_node = valid_node_func
    end

	local g_score, f_score = {}, {}
	g_score [ start ] = 0
	f_score [ start ] = g_score [ start ] + AStar.heuristic_cost_estimate ( start, goal )
	while #openset > 0 do
	
		local current = AStar.lowest_f_score ( openset, f_score )
		if current == goal then
			local path = AStar.unwind_path ( {}, came_from, goal )
            table.insert ( path, goal )
			return path
		end

		AStar.remove_node ( openset, current )		
		table.insert ( closedset, current )
		
		local neighbors = AStar.neighbor_nodes ( current, nodes )
		for _, neighbor in ipairs ( neighbors ) do 
			if AStar.not_in ( closedset, neighbor ) then
			
				local tentative_g_score = g_score [ current ] + AStar.dist_between ( current, neighbor )
				 
				if AStar.not_in ( openset, neighbor ) or tentative_g_score < g_score [ neighbor ] then 
					came_from 	[ neighbor ] = current
					g_score 	[ neighbor ] = tentative_g_score
					f_score 	[ neighbor ] = g_score [ neighbor ] + AStar.heuristic_cost_estimate ( neighbor, goal )
					if AStar.not_in ( openset, neighbor ) then
						table.insert ( openset, neighbor )
					end
				end
			end
		end
	end
	return nil -- no valid path
end

----------------------------------------------------------------
-- exposed functions
----------------------------------------------------------------

function AStar.clear_cached_paths ()
	cachedPaths = nil
end

function AStar.get_cached_paths ()
	return cachedPaths
end

function AStar.distance ( x1, y1, x2, y2 )
	return AStar.dist ( x1, y1, x2, y2 )
end

function AStar.path ( start, goal, nodes, ignore_cache, valid_node_func )
	if not cachedPaths then cachedPaths = {} end
	if not cachedPaths[start] then
		cachedPaths [start] = {}
	elseif cachedPaths[start][goal] and not ignore_cache then
		return cachedPaths[start][goal]
	end
    
    local resPath = AStar.a_star(start, goal, nodes, valid_node_func)
    if not cachedPaths[start][goal] and not ignore_cache then
        cachedPaths[start][goal] = resPath
    end

	return resPath
end


return AStar
