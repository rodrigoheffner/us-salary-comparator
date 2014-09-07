var DEFAULT_WIDTH = 960;
var DEFAULT_HEIGHT = 500;
var DEFAULT_PROJECTION = "d3.geo.aitoff()"

// key = templace placeholder
// value = value to replace placeholder
var templateKeysAndValues = {
    "P_WIDTH" : DEFAULT_WIDTH,
    "P_HEIGHT" : DEFAULT_HEIGHT,
    "P_PROJECTION" : DEFAULT_PROJECTION,
    "P_EFFECT_ROTATE_X" : "",
    "P_EFFECT_DRAG" : "",
    "SEA_COLOUR" : "#C2F4F4",
    "LAND_COLOUR" : "#D7C7AD"
}

var width = 960,
height = 500;

var projection = d3.geo.aitoff();

var graticule = d3.geo.graticule()(),
land,
boundaries;

var canvas = d3.select("#map").append("canvas")
.attr("width", width)
.attr("height", height)
.style("width", width + "px")
.style("height", height + "px")

var context = canvas.node().getContext("2d");
context.fillStyle = "#f9f9f9";
context.strokeStyle = "#000";

var path = d3.geo.path()
.projection(projection)
.context(context);

function redraw() {
    context.clearRect(0, 0, width, height);
    context.lineWidth = .5;
    
    context.fillStyle = $("#seaColour").val();
    context.beginPath(), path({
        type: "Sphere"
    }), context.stroke(), context.fill();
    
    if (land) {
        context.strokeStyle = "#000";
        context.fillStyle = $("#landColour").val();
        context.beginPath(), path(land), context.fill(), context.stroke();
        context.beginPath(), path(boundaries), context.stroke();
    }
    context.strokeStyle = "#999";
    context.beginPath(), path(graticule), context.stroke();
    context.lineWidth = 2.5, context.strokeStyle = "#000";
}

d3.json("js/data/world-110m.json", function(error, world) {
    land = topojson.feature(world, world.objects.land);
    boundaries = topojson.mesh(world, world.objects.countries, function(a, b) {
        return a !== b;
    });
    redraw()
});

// Code templace
var stringData = $.ajax({
    url: "js/data/template.txt",
    async: false
}).responseText;

// replacing < and > for correspondent html codes
var htmlText = stringData.replace(/</g, '&lt;').replace(/>/g, '&gt;');

var formattedText = htmlText;
for (key in templateKeysAndValues) {
    formattedText = formattedText.replace(key, templateKeysAndValues[key])
}

$(".xml").html(formattedText)

// Enabling tab navigation (twitter bootstrap)
$('.nar-tabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
})

// Form "onchange"
$("#widthTextField").bind("change paste keydown", function(e) {
    checkArrowKeysPressed(e, $(this))
    width = $(this).val();
    
    // Refreshing the template
    templateKeysAndValues["P_WIDTH"] = width
    refreshTemplate();
    
    // refreshing the map
    canvas.attr("width", width)
    .style("width", width + "px")

    redraw()
});
$("#heightTextField").bind("change paste keydown", function(e) {
    checkArrowKeysPressed(e, $(this))
    height = $(this).val();
    
    // Refreshing the template
    templateKeysAndValues["P_HEIGHT"] = height;
    refreshTemplate();
    
    // refreshing the map
    canvas.attr("height", height)
    .style("height", height + "px")
    
    redraw()
});
$("#scaleTextField").bind("change paste keydown", function(e) {
    checkArrowKeysPressed(e, $(this))
    projection.scale($(this).val());
    
    redraw()
});
$("#translateXTextField").bind("change paste keydown", function(e) {
    checkArrowKeysPressed(e, $(this))
    var translateX = $(this).val();
    var translateY = $("#translateYTextField").val();
    projection.translate([translateX, translateY]);
    
    redraw()
});
$("#translateYTextField").bind("change paste keydown", function(e) {
    checkArrowKeysPressed(e, $(this))
    var translateX = $("#translateXTextField").val();
    var translateY = $(this).val();
    projection.translate([translateX, translateY]);
    
    redraw()
});

function refreshTemplate() {
    formattedText = htmlText;
    for (key in templateKeysAndValues) {
        formattedText = formattedText.replace(key, templateKeysAndValues[key])
    }
    
    $(".xml").html(formattedText)
    $(".xml").each(function(i, e) {hljs.highlightBlock(e)});
}

// Checking if the user pressed up or down
function checkArrowKeysPressed(event, component) {
    event = event || window.event;
    
    if (event.keyCode == '38') {
        // up arrow
        component.val(parseInt(component.val()) + 1)
    }
    else if (event.keyCode == '40') {
        // down arrow
        component.val(parseInt(component.val()) - 1)
    }
}

var rotateEffect;
$("#rotateCheckbox").click(function(){
    var isChecked = $(this).is(":checked");
    
    if (isChecked) {
        rotateEffect = setInterval(function(){
            var rotateX = parseInt(projection.rotate()[0]) + 1.5;
            var rotateY = parseInt(projection.rotate()[1]);
    
            projection.rotate([rotateX, rotateY])
    
            redraw();
        }, 10)
        
        // refreshing the template
        templateKeysAndValues["P_EFFECT_ROTATE_X"] = "setInterval(function(){\n"+
        "            var rotateX = parseInt(projection.rotate()[0]) + 1.5;\n"+
        "            var rotateY = parseInt(projection.rotate()[1]);\n"+
        "\n"+
        "            projection.rotate([rotateX, rotateY])\n"+
        "\n"+
        "            redraw();\n"+
        "        }, 10);\n" +
        "\n"
        refreshTemplate();
    } else {
        clearInterval(rotateEffect)
        
        // refreshing the template
        templateKeysAndValues["P_EFFECT_ROTATE_X"] = "";
        refreshTemplate();
    }
})

var dragEffect;
$("#dragCheckbox").click(function(){
    var isChecked = $(this).is(":checked");
    
    if (isChecked) {
        canvas.call(d3.behavior.drag()
      .on("drag", function(d) {
            var rotate = [];
            rotate[0] = d3.event.x;
            rotate[1] = -d3.event.y;
            projection.rotate(rotate);
            redraw();
      }));
        
        // refreshing the template
        templateKeysAndValues["P_EFFECT_DRAG"] = "canvas.call(d3.behavior.drag()\n" +
        "        .on(\"drag\", function(d) {\n" + 
            "            var rotate = [];\n" +
            "            rotate[0] = d3.event.x;\n" +
            "            rotate[1] = -d3.event.y;\n" +
            "            projection.rotate(rotate);\n" +
            "            redraw(path);\n" +
        "        }));"+
        "\n"
        refreshTemplate();
    } else {
        canvas.call(d3.behavior.drag()
        .on("drag", function(d) {}));
        
        // refreshing the template
        templateKeysAndValues["P_EFFECT_DRAG"] = "";
        refreshTemplate();
    }
})

// projection options
var options = [
{
    name: "Aitoff", 
    projection: d3.geo.aitoff(),
    code: "d3.geo.aitoff()"
},
//{name: "Albers", projection: d3.geo.albers().scale(145).parallels([20, 50])},
{
    name: "August", 
    projection: d3.geo.august().scale(60),
    code: "d3.geo.august().scale(60)"
},
{
    name: "Baker", 
    projection: d3.geo.baker().scale(100),
    code: "d3.geo.baker().scale(100)"
},
{
    name: "Boggs", 
    projection: d3.geo.boggs(),
    code: "d3.geo.boggs()"
},
{
    name: "Bonne", 
    projection: d3.geo.bonne().scale(100),
    code: "d3.geo.bonne().scale(100)"
},
{
    name: "Bromley", 
    projection: d3.geo.bromley(),
    code: "d3.geo.bromley()"
},
{
    name: "Collignon", 
    projection: d3.geo.collignon().scale(93),
    code: "d3.geo.collignon().scale(93)"
},
{
    name: "Craster Parabolic", 
    projection: d3.geo.craster(),
    code: "d3.geo.craster()"
},
{
    name: "Eckert I", 
    projection: d3.geo.eckert1().scale(165),
    code: "d3.geo.eckert1().scale(165)"
},
{
    name: "Eckert II", 
    projection: d3.geo.eckert2().scale(165),
    code: "d3.geo.eckert2().scale(165)"
},
{
    name: "Eckert III", 
    projection: d3.geo.eckert3().scale(180),
    code: "d3.geo.eckert3().scale(180)"
},
{
    name: "Eckert IV", 
    projection: d3.geo.eckert4().scale(180),
    code: "d3.geo.eckert4().scale(180)"
},
{
    name: "Eckert V", 
    projection: d3.geo.eckert5().scale(170),
    code: "d3.geo.eckert5().scale(170)"
},
{
    name: "Eckert VI", 
    projection: d3.geo.eckert6().scale(170),
    code: "d3.geo.eckert6().scale(170)"
},
{
    name: "Eisenlohr", 
    projection: d3.geo.eisenlohr().scale(60),
    code: "d3.geo.eisenlohr().scale(60)"
},
{
    name: "Equirectangular (Plate Carrée)", 
    projection: d3.geo.equirectangular(),
    code: "d3.geo.equirectangular()"
},
{
    name: "Fahey", 
    projection: d3.geo.fahey().scale(120),
    code: "d3.geo.fahey().scale(120)"
},
{
    name: "Gall Stereographic", 
    projection: d3.geo.cylindricalStereographic().parallel(45).scale(140),
    code: "d3.geo.cylindricalStereographic().parallel(45).scale(140)"
},
{
    name: "Goode Homolosine", 
    projection: d3.geo.homolosine(),
    code: "d3.geo.homolosine()"
},
{
    name: "Ginzburg IV", 
    projection: d3.geo.ginzburg4().scale(120),
    code: "d3.geo.ginzburg4().scale(120)"
},
{
    name: "Ginzburg V", 
    projection: d3.geo.ginzburg5().scale(120),
    code: "d3.geo.ginzburg5().scale(120)"
},
{
    name: "Ginzburg VI", 
    projection: d3.geo.ginzburg6().scale(120),
    code: "d3.geo.ginzburg6().scale(120)"
},
{
    name: "Ginzburg VIII", 
    projection: d3.geo.ginzburg8().scale(120),
    code: "d3.geo.ginzburg8().scale(120)"
},
{
    name: "Ginzburg IX", 
    projection: d3.geo.ginzburg9().scale(120),
    code: "d3.geo.ginzburg9().scale(120)"
},
{
    name: "Gringorten", 
    projection: d3.geo.gringorten().scale(220),
    code: "d3.geo.gringorten().scale(220)"
},
{
    name: "Guyou", 
    projection: d3.geo.guyou().scale(150),
    code: "d3.geo.guyou().scale(150)"
},
{
    name: "Hammer", 
    projection: d3.geo.hammer().scale(165),
    code: "d3.geo.hammer().scale(165)"
},
{
    name: "Hill", 
    projection: d3.geo.hill().scale(120),
    code: "d3.geo.hill().scale(120)"
},
{
    name: "Kavrayskiy VII", 
    projection: d3.geo.kavrayskiy7(),
    code: "d3.geo.kavrayskiy7()"
},
{
    name: "Lagrange", 
    projection: d3.geo.lagrange().scale(120),
    code: "d3.geo.lagrange().scale(120)"
},
{
    name: "Lambert cylindrical equal-area", 
    projection: d3.geo.cylindricalEqualArea(),
    code: "d3.geo.cylindricalEqualArea()"
},
{
    name: "Larrivée", 
    projection: d3.geo.larrivee().scale(95),
    code: "d3.geo.larrivee().scale(95)"
},
{
    name: "Laskowski", 
    projection: d3.geo.laskowski().scale(120),
    code: "d3.geo.laskowski().scale(120)"
},
{
    name: "Loximuthal", 
    projection: d3.geo.loximuthal(),
    code: "d3.geo.loximuthal()"
},
{
    name: "Mercator", 
    projection: d3.geo.mercator().scale(100),
    code: "d3.geo.mercator().scale(100)"
},
{
    name: "Miller", 
    projection: d3.geo.miller().scale(100),
    code: "d3.geo.miller().scale(100)"
},
{
    name: "McBryde–Thomas Flat-Polar Parabolic", 
    projection: d3.geo.mtFlatPolarParabolic(),
    code: "d3.geo.mtFlatPolarParabolic()"
},
{
    name: "McBryde–Thomas Flat-Polar Quartic", 
    projection: d3.geo.mtFlatPolarQuartic(),
    code: "d3.geo.mtFlatPolarQuartic()"
},
{
    name: "McBryde–Thomas Flat-Polar Sinusoidal", 
    projection: d3.geo.mtFlatPolarSinusoidal(),
    code: "d3.geo.mtFlatPolarSinusoidal()"
},
{
    name: "Mollweide", 
    projection: d3.geo.mollweide().scale(165),
    code: "d3.geo.mollweide().scale(165)"
},
{
    name: "Natural Earth", 
    projection: d3.geo.naturalEarth(),
    code: "d3.geo.naturalEarth()"
},
{
    name: "Nell–Hammer", 
    projection: d3.geo.nellHammer(),
    code: "d3.geo.nellHammer()"
},
{
    name: "Polyconic", 
    projection: d3.geo.polyconic().scale(100),
    code: "d3.geo.polyconic().scale(100)"
},
{
    name: "Rectangular Polyconic", 
    projection: d3.geo.rectangularPolyconic().scale(120),
    code: "d3.geo.rectangularPolyconic().scale(120)"
},
{
    name: "Robinson", 
    projection: d3.geo.robinson(),
    code: "d3.geo.robinson()"
},
{
    name: "Sinusoidal", 
    projection: d3.geo.sinusoidal(),
    code: "d3.geo.sinusoidal()"
},
{
    name: "Sinu-Mollweide", 
    projection: d3.geo.sinuMollweide(),
    code: "d3.geo.sinuMollweide()"
},
{
    name: "Times", 
    projection: d3.geo.times().scale(140),
    code: "d3.geo.times().scale(140)"
},
{
    name: "Van der Grinten", 
    projection: d3.geo.vanDerGrinten().scale(75),
    code: "d3.geo.vanDerGrinten().scale(75)"
},
{
    name: "Van der Grinten II", 
    projection: d3.geo.vanDerGrinten2().scale(75),
    code: "d3.geo.vanDerGrinten2().scale(75)"
},
{
    name: "Van der Grinten III", 
    projection: d3.geo.vanDerGrinten3().scale(75),
    code: "d3.geo.vanDerGrinten3().scale(75)"
},
{
    name: "Van der Grinten IV", 
    projection: d3.geo.vanDerGrinten4().scale(120),
    code: "d3.geo.vanDerGrinten4().scale(120)"
},
{
    name: "Wagner IV", 
    projection: d3.geo.wagner4(),
    code: "d3.geo.wagner4()"
},
{
    name: "Wagner VI", 
    projection: d3.geo.wagner6(),
    code: "d3.geo.wagner6()"
},
{
    name: "Wagner VII", 
    projection: d3.geo.wagner7(),
    code: "d3.geo.wagner7()"
},
{
    name: "Winkel Tripel", 
    projection: d3.geo.winkel3(),
    code: "d3.geo.winkel3()"
}
];

// setting up the projections select options (credit: www.jasondavies.com/maps/transition/)
var projectionSelect = d3.select("#projectionSelect")
.on("change", updateProjection)
.selectAll("option")
.data(options)
.enter().append("option")
.text(function(d) {
    return d.name;
});

function updateProjection() {
    projection = options[this.selectedIndex].projection
    
    path.projection(projection);
    
    // Refreshing the template
    templateKeysAndValues["P_PROJECTION"] = options[this.selectedIndex].code;
    refreshTemplate();
    
    
    $("#scaleTextField").val(parseInt(projection.scale()));
    
    redraw();
}