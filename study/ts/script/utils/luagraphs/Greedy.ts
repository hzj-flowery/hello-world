import { table } from "../table";

export default class Greedy {
    static findPath(start, dest, graph) {
        var pathList = [];
        var vertex = start;
        var data = Greedy._create_dijkstra(start);
        var dijkstra:Function = data[0];
        var shortest_paths = data[1];
        while (vertex && vertex != dest) {
            for (let adjacent_vertex in graph[vertex]) {
                let edge_length = graph[vertex][adjacent_vertex];
                dijkstra(adjacent_vertex, edge_length);
            }
            vertex = dijkstra();
        }
        if (vertex) {
            var full_distance = shortest_paths[vertex].full_distance;
            var path = vertex;
            pathList.unshift(parseInt(vertex))
            while (vertex) {
                vertex = shortest_paths[vertex].previous_vertex;
                if (vertex) {
                    path = vertex + (' ' + path);
                    pathList.unshift(parseInt(vertex));
                }
            }
            console.log(full_distance, path);
        } else {
            console.log('Path not found');
        }
        return pathList;
    };
    static _create_dijkstra(starting_vertex):Array<any> {
        var shortest_paths = { [starting_vertex]: { full_distance: 0 } };
        var vertex = starting_vertex, distance = 0, heap_size = 0, heap = {};
        var retFunc = function (adjacent_vertex, edge_length = 0) {
            if (adjacent_vertex) {
                var new_distance = distance + edge_length;
                var adjacent_vertex_info: any = shortest_paths[adjacent_vertex];
                var pos;
                if (adjacent_vertex_info) {
                    if (new_distance < adjacent_vertex_info.full_distance) {
                        adjacent_vertex_info.full_distance = new_distance;
                        adjacent_vertex_info.previous_vertex = vertex;
                        pos = adjacent_vertex_info.index;
                    } else {
                        return null;
                    }
                } else {
                    adjacent_vertex_info = {
                        full_distance: new_distance,
                        previous_vertex: vertex,
                        index: 0
                    };
                    shortest_paths[adjacent_vertex] = adjacent_vertex_info;
                    heap_size = heap_size + 1;
                    pos = heap_size;
                }
                while (pos > 1) {
                    var parent_pos = (pos - pos % 2) / 2;
                    var parent = heap[parent_pos];
                    var parent_info: any = shortest_paths[parent];
                    if (new_distance < parent_info.full_distance) {
                        heap[pos] = parent;
                        parent_info.index = pos;
                        pos = parent_pos;
                    } else {
                        break;
                    }
                }
                heap[pos] = adjacent_vertex;
                adjacent_vertex_info.index = pos;
            } else if (heap_size > 0) {
                vertex = heap[1];
                var parent = heap[heap_size];
                heap[heap_size] = null;
                heap_size = heap_size - 1;
                if (heap_size > 0) {
                    let pos = 1;
                    var last_node_pos = heap_size / 2;
                    let parent_info: any = shortest_paths[parent];
                    var parent_distance = parent_info.full_distance;
                    while (pos <= last_node_pos) {
                        var child_pos = pos + pos;
                        var child = heap[child_pos];
                        var child_info: any = shortest_paths[child];
                        var child_distance = child_info.full_distance;
                        if (child_pos < heap_size) {
                            var child_pos2 = child_pos + 1;
                            var child2 = heap[child_pos2];
                            var child2_info = shortest_paths[child2];
                            var child2_distance = child2_info.full_distance;
                            if (child2_distance < child_distance) {
                                child_pos = child_pos2;
                                child = child2;
                                child_info = child2_info;
                                child_distance = child2_distance;
                            }
                        }
                        if (child_distance < parent_distance) {
                            heap[pos] = child;
                            child_info.index = pos;
                            pos = child_pos;
                        } else {
                            break;
                        }
                    }
                    heap[pos] = parent;
                    parent_info.index = pos;
                }
                var vertex_info: any = shortest_paths[vertex];
                vertex_info.index = null;
                distance = vertex_info.full_distance;
                return vertex;
            }
        }
        return [
            retFunc,
            shortest_paths
        ];
    };
}