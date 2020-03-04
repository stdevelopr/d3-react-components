import React, { useRef, useState, useEffect } from "react";
import {
  select,
  min,
  max,
  scaleLinear,
  scaleBand,
  scaleTime,
  axisBottom,
  axisLeft,
  selectAll,
  mouse,
  timeFormat,
  zoom
} from "d3";
import { zoomTransform } from "d3-zoom";
// import { selectAll } from 'd3-selection';

const mock_data = [
  {
    o: "1.1076", // Open
    h: "1.1097", // High
    l: "1.1027", // Low
    c: "1.1085", // Close
    v: "103824", // Volume
    t: "1564617600", // Time Unix Format (UTC)
    tm: "2019-08-01 00:00:00" // Date Time (UTC)
  },
  {
    o: "1.1087",
    h: "1.1118",
    l: "1.107",
    c: "1.1109",
    v: "97580",
    t: "1564704000",
    tm: "2019-08-02 00:00:00"
  },
  {
    o: "1.1101",
    h: "1.1213",
    l: "1.1101",
    c: "1.1202",
    v: "100405",
    t: "1564963200",
    tm: "2019-08-05 00:00:00"
  }
];

const Candlestick = (id = "myZoomableLineChart") => {
  const svgRef = useRef();
  const [data, setData] = useState(mock_data);
  const [currentZoomState, setCurrentZoomState] = useState();

  //chart plot area
  const padding = { top: 20, right: 20, bottom: 20, left: 40 };
  const chartArea = {
    width: 1000,
    height: 400
  };

  const candleWidth = 20;

  // style the svg element only once
  useEffect(() => {
    console.log("1");
    const svg = select(svgRef.current);
    svg
      .style("width", chartArea.width)
      .style("height", chartArea.height)
      .style("background", "#eee");
  }, []);

  // update the content of the svg
  useEffect(() => {
    console.log("2");
    const svg = select(svgRef.current);
    svg.selectAll(".candle").remove();

    // transform functions
    const xValue = d => new Date(d.tm);
    const yoValue = d => +d.o;
    const yhValue = d => +d.h;
    const ylValue = d => +d.l;
    const ycValue = d => +d.c;

    // ref values
    const minX = min(data, xValue);
    const maxX = max(data, xValue);
    const minY = min(data, ylValue);
    const maxY = max(data, yhValue);

    //scale functions
    const xScale = scaleTime()
      .domain([minX, maxX])
      .range([0, chartArea.width - padding.left - padding.right]);

    if (currentZoomState) {
      const newXScale = currentZoomState.rescaleX(xScale);
      xScale.domain(newXScale.domain());
    }

    const yScale = scaleLinear()
      .domain([minY, maxY])
      .range([chartArea.height - padding.top - padding.bottom, 0]);

    // axis
    const xAxis = axisBottom(xScale).tickFormat(timeFormat("%d %B %y"));
    svg
      .select(".x-axis")
      .attr(
        "transform",
        `translate(${padding.left + candleWidth / 2}, ${chartArea.height -
          padding.bottom})`
      )
      .call(xAxis);

    const yAxis = axisLeft(yScale);
    svg
      .select(".y-axis")
      .attr("transform", `translate(${padding.left}, ${padding.top})`)
      .call(axisLeft(yScale));

    const plot = svg
      .select(".content")
      .attr(
        "transform",
        `translate(${padding.left + candleWidth / 2}, ${padding.top})`
      )
      .selectAll(".candle")
      .data(data);

    const lines = plot
      .enter()
      .append("line")
      .attr("class", "candle")
      .attr("x1", d => xScale(xValue(d)))
      .attr("x2", d => xScale(xValue(d)))
      .attr("y1", d => yScale(ylValue(d)))
      .attr("y2", d => yScale(yhValue(d)))
      .attr("stroke", "blue");

    const candles = plot
      .enter()
      .append("rect")
      .attr("class", "candle")
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
      .on("mouseenter", (value, index) => {
        console.log(value, index);

        svg
          .selectAll(".tooltip")
          .data([value])
          .join("text")
          .attr("class", "tooltip")
          .text(value["l"])
          .attr("transform", `translate(${padding.left}, ${padding.top})`);
      });

    svg.on("mousemove", function() {
      const position = mouse(this);
      const x_pos = position[0];
      const y_pos = position[1];
      const mouseDate = xScale.invert(position[0]);
      // const elem = select(".content");
      selectAll(".crosshair").remove();
      select(".content")
        .append("line")
        .attr("class", "crosshair")
        .attr("x1", x_pos - padding.left - candleWidth / 2)
        .attr("x2", x_pos - padding.left - candleWidth / 2)
        .attr("y1", -padding.top)
        .attr("y2", chartArea.height - padding.top - padding.bottom)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", 5);
      select(".content")
        .append("line")
        .attr("class", "crosshair")
        .attr("x1", -padding.left)
        .attr("x2", chartArea.width)
        .attr("y1", y_pos - padding.top)
        .attr("y2", y_pos - padding.top)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", 5);
    });

    // zoom
    const zoomBehaviour = zoom()
      // 0.5 stands for 2 times zoom out, and 5 for 5 times zoom in
      .scaleExtent([0.5, 5])
      // .translateExtent([[0, 0], [chartArea.width, chartArea.height]])
      .on("zoom", () => {
        const zoomState = zoomTransform(svgRef.current);
        setCurrentZoomState(zoomState);
      });

    svg.call(zoomBehaviour);
  }, [currentZoomState, data]);
  return (
    <React.Fragment>
      <div>
        <svg ref={svgRef}>
          <defs>
            <clipPath id="clip">
              <rect
                x={-padding.left / 4}
                y={0}
                width={chartArea.width - padding.left}
                height={chartArea.width}
              />
            </clipPath>
          </defs>
          <g className="x-axis"></g>
          <g className="y-axis"></g>
          <g className="content" clipPath={`url(#clip)`}></g>
        </svg>
      </div>
    </React.Fragment>
  );
};

export default Candlestick;
