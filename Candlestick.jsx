import React, { useRef, useEffect } from 'react'
import { select, min, max, scaleLinear, scaleTime, axisBottom, axisLeft, timeFormat, local } from "d3"
// import { selectAll } from 'd3-selection';

const data = [
    {
        "o": "1.1076", // Open 
        "h": "1.1097", // High 
        "l": "1.1027", // Low 
        "c": "1.1085", // Close 
        "v": "103824", // Volume
        "t": "1564617600", // Time Unix Format (UTC) 
        "tm": "2019-08-01 00:00:00" // Date Time (UTC)
    },
    {
        "o": "1.1087",
        "h": "1.1118",
        "l": "1.107",
        "c": "1.1109",
        "v": "97580",
        "t": "1564704000",
        "tm": "2019-08-02 00:00:00"
    },
    {
        "o": "1.1101",
        "h": "1.1213",
        "l": "1.1101",
        "c": "1.1202",
        "v": "100405",
        "t": "1564963200",
        "tm": "2019-08-05 00:00:00"
    }]

const Candlestick = () => {
    const svgRef = useRef()

    useEffect(() => {

        const svg = select(svgRef.current)

        //chart plot area
        const padding = { top: 20, right: 20, bottom: 20, left: 40 };
        const chartArea = {
            width: parseInt(svg.style("width")) - padding.left - padding.right,
            height: parseInt(svg.style("height")) - padding.top - padding.bottom
        };

        // transform functions
        const xValue = d => new Date(d.tm);
        const yoValue = d => +d.o;
        const yhValue = d => +d.h;
        const ylValue = d => +d.l;
        const ycValue = d => +d.c;

        // ref values
        const minX = min(data, xValue)
        const maxX = max(data, xValue)
        const minY = min(data, ylValue)
        const maxY = max(data, yhValue)


        //scale functions
        const xScale = scaleTime()
            .domain([minX, maxX])
            .range([0, chartArea.width]);

        const yScale = scaleLinear()
            .domain([minY, maxY])
            .range([chartArea.height, 0]);

        // axis
        const xAxis = svg
            .append("g")
            .attr(
                "transform",
                `translate(${padding.left}, ${chartArea.height + padding.top})`
            )
            .call(axisBottom().scale(xScale).tickFormat(timeFormat("%d %B %y")));

        const yAxis = svg
            .append("g")
            .attr("transform", `translate(${padding.left}, ${padding.top})`)
            .call(axisLeft(yScale));


        const plot = svg
            .append("g")
            .attr("transform", `translate(${padding.left}, ${padding.top})`)
            .selectAll("rect")
            .data(data)

        const lines = plot
            .enter()
            .append("line")
            .attr("x1", d => xScale(xValue(d)))
            .attr("x2", d => xScale(xValue(d)))
            .attr("y1", d => yScale(ylValue(d)))
            .attr("y2", d => yScale(yhValue(d)))
            .attr("stroke", "black")


        const candleWidth = 20
        const candles = plot
            .enter()
            .append("rect")
            .attr("x", d => xScale(xValue(d)) - candleWidth / 2)
            .attr("y", d => {
                if (yoValue(d) > ycValue(d)) return yScale(yoValue(d));
                else return yScale(ycValue(d));
            })
            .attr("height", d => Math.abs(yScale(yoValue(d)) - yScale(ycValue(d))))
            .style("fill", d => {
                if (yoValue(d) > ycValue(d)) return "red";
                else return "green";
            })
            .attr("width", candleWidth)


    }, [data])
    return (
        <React.Fragment>
            <svg ref={svgRef} style={{ width: "1400px", height: "400px" }}></svg>
        </React.Fragment>
    )
}

export default Candlestick
