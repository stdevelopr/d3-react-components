import React, { useRef, useEffect } from 'react'
import { select } from "d3"


const Candlestick = () => {
    const svgRef = useRef()

    useEffect(() => {
        const svg = select(svgRef.current)
        // ... d3 logic
    }, [])
    return (
        <React.Fragment>
            <svg ref={svgRef}></svg>
        </React.Fragment>
    )
}

export default Candlestick
