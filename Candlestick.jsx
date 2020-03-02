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

const Candlestick = () => {
  const svgRef = useRef();
  const [data, setData] = useState(mock_data);
  const [currentZoomState, setCurrentZoomState] = useState();

  useEffect(() => {
    const svg = select(svgRef.current);
    svg.selectAll(".candle").remove();

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
    const minX = min(data, xValue);
    const maxX = max(data, xValue);
    const minY = min(data, ylValue);
    const maxY = max(data, yhValue);

    //scale functions
    const xScale = scaleTime()
      .domain([minX, maxX])
      .range([0, chartArea.width]);

    if (currentZoomState) {
      const newXScale = currentZoomState.rescaleX(xScale);
      xScale.domain(newXScale.domain());
    }

    const yScale = scaleLinear()
      .domain([minY, maxY])
      .range([chartArea.height, 0]);

    // axis
    const xAxis = axisBottom(xScale).tickFormat(timeFormat("%d %B %y"));
    svg
      .select(".x-axis")
      .attr(
        "transform",
        `translate(${padding.left}, ${chartArea.height + padding.top})`
      )
      .call(xAxis);

    const yAxis = axisLeft(yScale);
    svg
      .select(".y-axis")
      .attr("transform", `translate(${padding.left}, ${padding.top})`)
      .call(axisLeft(yScale));

    // TODO make it the visible area
    // const background = svg
    //   .append("g")
    //   .append("rect")
    //   .attr("x", padding.left)
    //   .attr("y", padding.top)
    //   .attr("height", chartArea.height)
    //   .attr("width", chartArea.width)
    //   .style("fill", "gray");

    const plot = svg
      .select(".content")
      .attr("transform", `translate(${padding.left}, ${padding.top})`)
      .selectAll(".candle")
      .data(data);

    console.log(plot);

    const lines = plot
      .enter()
      .append("line")
      .attr("class", "candle")
      .attr("x1", d => xScale(xValue(d)))
      .attr("x2", d => xScale(xValue(d)))
      .attr("y1", d => yScale(ylValue(d)))
      .attr("y2", d => yScale(yhValue(d)))
      .attr("stroke", "blue");

    const candleWidth = 20;
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
          .text(value["c"])
          .attr("transform", `translate(${padding.left}, ${padding.top})`);
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
      <svg
        ref={svgRef}
        style={{ width: "1400px", height: "400px", background: "#eee" }}
      >
        <g className="x-axis"></g>
        <g className="y-axis"></g>
        <g className="content"></g>
      </svg>
    </React.Fragment>
  );
};

export default Candlestick;
