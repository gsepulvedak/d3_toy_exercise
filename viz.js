window.onload = function () {
    
    // set svg configuration
    var height = 650;
    var width = 990;
    var svg = d3.selectAll("svg")
        .attr("height", height)
        .attr("width", width)
        .attr("class", "canvas");

    // set graph margins
    var margin = {left: 80, top: 90, right: 40, bottom: 50};

    // parser function for data reading stage
    var rowParser = function(d) {
        return {
            Day: d.Day,
            TimeOfDay: parseInt(d.TimeOfDay),
            HourlyAverage: parseFloat(d.HourlyAverage)                    
        };
    };

    // group filtering function
    var filterData = function(d, group){
        return d.filter(function(v){return v.Day == group})
    };

    // create visualisation
    d3.csv("data/PedestrianCountingSystemWeekdaysAndWeekends.csv", rowParser, function(d){

        // x-axis scale
        var xScale = d3.scaleLinear()
                        .domain(d3.extent(d, function(v) {return v["TimeOfDay"]}))
                        .range([margin.left, width - margin.right]);

        //y-axis scale
        var yScale = d3.scaleLinear()
                        .domain([0, 
                                 d3.max(d, function(v){return v["HourlyAverage"]}
                        )])
                        .range([height - margin.bottom, margin.top]);

        // x-axis
        var xAxis = d3.axisBottom()
                        .scale(xScale)
                        .ticks(24); // a bit of customisation

        // y-axis
        var yAxis = d3.axisLeft()
                        .scale(yScale)
                        .ticks(14); // a bit of customisation

        // create line generator
        var dataSeries = d3.line()
                            .x(function(d){return xScale(d.TimeOfDay)})
                            .y(function(d){return yScale(d.HourlyAverage)})

        // draw line paths
        // weekends
        svg.append("path")
            .datum(filterData(d, "Weekend"))
            .attr("class", "weekend line")
            .attr("d", dataSeries)

        // weekdays
        svg.append("path")
            .datum(filterData(d, "Weekday"))
            .attr("class", "weekday line")
            .attr("d", dataSeries)

        // draw circles
        svg.selectAll("circle")
            .data(d)
            .enter()
            .append("circle")
            .attr("cx", function(d){
                return xScale(d.TimeOfDay)
        })
            .attr("cy", function(d){
                return yScale(d.HourlyAverage)
        })
            .attr("r", 7)
            .attr("class", function(v){
                if (v.Day == "Weekday"){
                    return "weekday"
                } else {
                    return "weekend"
                };
        })
        // tooltip
            .on("mouseover", function(d){

                // enlarge circles
                d3.select(this)
                    .attr("r", 10);

                // get feature position
                var xPosition = parseFloat(d3.select(this).attr("cx"));                 
                var yPosition = parseFloat(d3.select(this).attr("cy"));                

                // display tooltip
                d3.select("#tooltip")
                    .style("left", (xPosition + 20) + "px")
                    .style("top", (yPosition + 30) + "px")
                    .select("#dayType")
                    .text(d.Day);

                d3.select("#dayTime")
                    .text(d.TimeOfDay);

                d3.select("#average")
                    .text(Math.round(d.HourlyAverage *100)/100);

                d3.select("#tooltip")
                    .classed("hidden", false);

            })
            .on("mouseout", function(){
                d3.select("#tooltip").classed("hidden", true);
                d3.select(this)
                    .attr("r", 7);
        });

        // draw axes
        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .call(yAxis);

        
        // attention to "finding" annotation (blink every 5 secs)
        svg.append("foreignObject")
            .attr("id", "foreign")
            .attr("width", 130)
            .attr("height", 30)
            .attr("x", width / 10)
            .attr("y", margin.top)
            .append("xhtml:body")
                .attr("id", "findingText")
                .attr("class", "annotation blink")
                .html("Show findings...");
        
        // display annotation
        d3.select("#findingText")
            .on("mouseover", function(){

                d3.select(this)
                    .attr("class", "annotation");
            
                // get position relative to blinking text
                var xAnnotation = parseFloat(d3.select("#foreign").attr("x"));
                var yAnnotation = parseFloat(d3.select("#foreign").attr("y"));
                
                d3.select("#finding")
                    .style("left", (xAnnotation + 5) + "px")
                    .style("top", (yAnnotation + 120) + "px")
                    .classed("hidden", false);

            })
            .on("mouseout", function(){

                d3.select("#finding")
                    .classed("hidden", true);
        })


        // ----------- extras
        // plot title
        svg.append("text")
            .attr("x", (width - margin.right + margin.left) / 2)
            .attr("y", margin.top / 2)
            .attr("class", "annotation")
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Pedestrian weekend and weekday hourly average count in Melbourne CBD.")

        // axes names
        // x-axis
        svg.append("text")
            .attr("class", "annotation")
            .attr("x", (width - margin.right + margin.left) / 2)
            .attr("y", height - (margin.bottom / 3))
            .attr("text-anchor", "middle")
            .text("Day hour")

        // y-axis
        svg.append("text")
            .attr("class", "annotation")
            .attr("x", 0 - (margin.top + (height - margin.bottom)) / 2)
            .attr("y", margin.left / 3)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text("Pedestrian average count")

        // legend - totally manual and hard coded - version 0

        var xLegend = width - margin.right - 120;
        var yLegend = margin.top + 50;
        var legendWidth = 100;
        var legendHeight = 50;

        svg.append("g")
            .attr("id", "legend")
            .attr("x", xLegend)
            .attr("y", yLegend)
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        d3.select("#legend")
            .append("line")
            .attr("class", "line weekday")
            .attr("x1", xLegend + 10)
            .attr("y1", yLegend + 5)
            .attr("x2", xLegend + 30)
            .attr("y2", yLegend + 5);

        d3.select("#legend")
            .append("text")
            .attr("class", "annotation")
            .attr("x", xLegend + 50)
            .attr("y", yLegend + 8)
            .text("Weekday")

        d3.select("#legend")
            .append("line")
            .attr("class", "line weekend")
            .attr("x1", xLegend + 10)
            .attr("y1", yLegend + 25)
            .attr("x2", xLegend + 30)
            .attr("y2", yLegend + 25);

        d3.select("#legend")
            .append("text")
            .attr("class", "annotation")
            .attr("x", xLegend + 50)
            .attr("y", yLegend + 28)
            .text("Weekend");

        d3.select("#legend")
            .append("text")
            .attr("class", "annotation")
            .attr("x", xLegend + 10)
            .attr("y", yLegend - 15)
            .style("font-weight", "bold")
            .style("font-size", "18px")
            .text("Day type");


        });
    
};