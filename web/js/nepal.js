var qs = querystring.parse();

var stage = 'none',
    appLayout = 'vfc',
    useAppLayout = true,
    treeOnly = qs.treeOnly !== 'false',
    linkLength = 50,
    transition = 1000,
    showSteps = false,
    shape = qs.shape || null,
    radius = +qs.radius || 25,
    fill = qs.fill || 'white',
    timeLimit = 10000,
    file = qs.file || null,
    paths = qs.paths || null;

if(!file)
    throw new Error('need a file');

var diagram = dc_graph.diagram('#graph'), runner;

app_layouts[appLayout].init && app_layouts[appLayout].init();

var source = function(callback) {
    dc_graph.load_graph(file, callback);
};

source(function(error, data) {
    if(error) {
        console.log(error);
        return;
    }
    var graph_data = munge_graph(data),
        nodes = graph_data.nodes,
        edges = graph_data.edges,
        sourceattr = graph_data.sourceattr,
        targetattr = graph_data.targetattr,
        nodekeyattr = graph_data.nodekeyattr;

    var edge_flat = flat_group.make(edges, function(d) {
        return d[sourceattr] + '-' + d[targetattr] + (d.par ? ':' + d.par : '');
    }),
        node_flat = flat_group.make(nodes, function(d) { return d[nodekeyattr]; });

    appLayout && app_layouts[appLayout].data && app_layouts[appLayout].data(nodes, edges);

    var rule_constraints = null;
    var rules = appLayout && app_layouts[appLayout].rules;
    if(rules)
        rule_constraints = dc_graph.constraint_pattern(rules);

    function constrain(diagram, nodes, edges) {
        var constraintses = [];
        if(appLayout && useAppLayout && rule_constraints)
            constraintses.push(rule_constraints(diagram, nodes, edges));

        if(appLayout && useAppLayout && app_layouts[appLayout].constraints)
            constraintses.push(app_layouts[appLayout].constraints(diagram, nodes, edges));
        return Array.prototype.concat.apply([], constraintses);
    }

    diagram
        .width($(window).width())
        .height($(window).height())
        .timeLimit(timeLimit)
        .transitionDuration(transition)
        .stageTransitions(stage)
        .showLayoutSteps(showSteps)
        .nodeDimension(node_flat.dimension).nodeGroup(node_flat.group)
        .edgeDimension(edge_flat.dimension).edgeGroup(edge_flat.group)
        .edgeSource(function(e) { return e.value[sourceattr]; })
        .edgeTarget(function(e) { return e.value[targetattr]; })
        .nodeLabel(function(n) { return n.value.name.split('/'); })
        .nodeShape(shape)
        .nodeRadius(radius)
        .nodeFill(appLayout && app_layouts[appLayout].colors || fill)
        .nodeFixed(appLayout && app_layouts[appLayout].node_fixed)
        .constrain(constrain)
        .lengthStrategy(useAppLayout ? app_layouts[appLayout].lengthStrategy || 'none' :
                        'symmetric')
        .edgeArrowhead(function(kv) {
            return kv.value.undirected ? null : 'vee';
        })
        .child('highlight-neighbors',
               dc_graph.highlight_neighbors({
                   edgeStroke: 'orange',
                   edgeStrokeWidth: 3
               }));

    appLayout && app_layouts[appLayout].initDiagram && app_layouts[appLayout].initDiagram(diagram);
    diagram.initLayoutOnRedraw(appLayout && useAppLayout);

    dc.renderAll();

    if(paths)
        iterate_paths(diagram, paths);
});
