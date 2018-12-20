dc_graph.mode = function(event_namespace, options) {
    var _mode = {};
    var _eventName = options.laterDraw ? 'transitionsStarted' : 'drawn';

    /**
     #### .parent([object])
     Assigns this mode to a diagram.
     **/
    _mode.parent = property(null)
        .react(function(p) {
            var diagram;
            if(p) {
                var first = true;
                diagram = p;
                p.on(_eventName + '.' + event_namespace, function(node, edge, ehover) {
                    options.add_behavior(diagram, node, edge, ehover);
                    if(first && options.first) {
                        options.first(diagram, node, edge, ehover);
                        first = false;
                    }
                    else if(options.rest)
                        options.rest(diagram, node, edge, ehover);
                });
                p.on('reset.' + event_namespace, function() {
                    options.remove_behavior(diagram, diagram.selectAllNodes(), diagram.selectAllEdges(), diagram.selectAllEdges('.edge-hover'));
                });
            }
            else if(_mode.parent()) {
                diagram = _mode.parent();
                diagram.on(_eventName + '.' + event_namespace, function(node, edge, ehover) {
                    options.remove_behavior(diagram, node, edge, ehover);
                    diagram.on(_eventName + '.' + event_namespace, null);
                });
            }
            options.parent && options.parent(p);
        });
    return _mode;
};

dc_graph.behavior = deprecate_function('dc_graph.behavior has been renamed dc_graph.mode', dc_graph.mode);
