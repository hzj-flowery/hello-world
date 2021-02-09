--https://stackoverflow.com/questions/55893940/why-is-this-lua-dijkstras-algorithm-not-working-in-some-cases
local Greedy = {}

function Greedy.findPath(start, dest, graph)
    local pathList = {}
    local vertex, dijkstra, shortest_paths = start, Greedy._create_dijkstra(start)
    while vertex and vertex ~= dest do
        -- send information about all adjacent vertexes of "vertex"
        for adjacent_vertex, edge_length in pairs(graph[vertex]) do
            dijkstra(adjacent_vertex, edge_length)
        end
        vertex = dijkstra()  -- now dijkstra is asking you about the neighborhood of another vertex
    end
    if vertex then
        local full_distance = shortest_paths[vertex].full_distance
        local path = vertex
        table.insert(pathList, 1, vertex)
        while vertex do
            vertex = shortest_paths[vertex].previous_vertex
            if vertex then
                path = vertex.." "..path
                table.insert(pathList, 1, vertex)
            end
        end
        print(full_distance, path)
    else
        print"Path not found"
    end
    return pathList
end

function Greedy._create_dijkstra(starting_vertex)
    local shortest_paths = {[starting_vertex] = {full_distance = 0}}
    local vertex, distance, heap_size, heap = starting_vertex, 0, 0, {}
    return
       function (adjacent_vertex, edge_length)
          if adjacent_vertex then
             -- receiving the information about adjacent vertex
             local new_distance = distance + edge_length
             local adjacent_vertex_info = shortest_paths[adjacent_vertex]
             local pos
             if adjacent_vertex_info then
                if new_distance < adjacent_vertex_info.full_distance then
                   adjacent_vertex_info.full_distance = new_distance
                   adjacent_vertex_info.previous_vertex = vertex
                   pos = adjacent_vertex_info.index
                else
                   return
                end
             else
                adjacent_vertex_info = {full_distance = new_distance, previous_vertex = vertex, index = 0}
                shortest_paths[adjacent_vertex] = adjacent_vertex_info
                heap_size = heap_size + 1
                pos = heap_size
             end
             while pos > 1 do
                local parent_pos = (pos - pos % 2) / 2
                local parent = heap[parent_pos]
                local parent_info = shortest_paths[parent]
                if new_distance < parent_info.full_distance then
                   heap[pos] = parent
                   parent_info.index = pos
                   pos = parent_pos
                else
                   break
                end
             end
             heap[pos] = adjacent_vertex
             adjacent_vertex_info.index = pos
          elseif heap_size > 0 then
             -- which vertex neighborhood to ask for?
             vertex = heap[1]
             local parent = heap[heap_size]
             heap[heap_size] = nil
             heap_size = heap_size - 1
             if heap_size > 0 then
                local pos = 1
                local last_node_pos = heap_size / 2
                local parent_info = shortest_paths[parent]
                local parent_distance = parent_info.full_distance
                while pos <= last_node_pos do
                   local child_pos = pos + pos
                   local child = heap[child_pos]
                   local child_info = shortest_paths[child]
                   local child_distance = child_info.full_distance
                   if child_pos < heap_size then
                      local child_pos2 = child_pos + 1
                      local child2 = heap[child_pos2]
                      local child2_info = shortest_paths[child2]
                      local child2_distance = child2_info.full_distance
                      if child2_distance < child_distance then
                         child_pos = child_pos2
                         child = child2
                         child_info = child2_info
                         child_distance = child2_distance
                      end
                   end
                   if child_distance < parent_distance then
                      heap[pos] = child
                      child_info.index = pos
                      pos = child_pos
                   else
                      break
                   end
                end
                heap[pos] = parent
                parent_info.index = pos
             end
             local vertex_info = shortest_paths[vertex]
             vertex_info.index = nil
             distance = vertex_info.full_distance
             return vertex
          end
       end,
       shortest_paths
 end

return Greedy