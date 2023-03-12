let margin = {top: 15, right: 50, bottom: 50, left: 50}

let width = 700, height = 400

let svg = d3.select('#svg')
.append('svg')
.attr('width', margin.left + width + margin.right)
.attr('height', margin.top + height + margin.bottom)

updateChart('CLT')

d3.select('#select-city').on('change', function() {
	let city = this.value
	updateChart(city)
})

d3.select('#check-show').on('click', function() {
	    let showCircles = this.checked
	
	    d3.selectAll('circle')
	    .transition()
	    .duration(200)
	    .style('opacity', showCircles ? 1 : 0)
	})
function updateChart(city) {
	let showCircles = d3.select('#check-show').node().checked

	d3.csv(`./${city}.csv`).then(data => {
		
		svg.selectAll('.axis').remove()


		let timeScale = d3.scaleTime()
		.domain([new Date('2014-7-1'), new Date('2015-7-1')])
		.range([margin.left, margin.left + width])

		let yScale = d3.scaleLinear()
		.domain([-20, 110]) 
		.range([margin.top + height, margin.top])

		let maxLineFunc = d3.line()
		.x(d => timeScale(new Date(d['date'])))
		.y(d => yScale(d['record_max_temp']))

		svg.selectAll('.max-line')
		.data([data])
		.join('path')
		.attr('class', 'max-line')
		.style('fill', 'none')
		.style('stroke', 'orangered')
		.style('stroke-width', 1)
		.transition()
		.duration(600)
		.attr('d', maxLineFunc)

		let minLineFunc = d3.line()
		.x(d => timeScale(new Date(d['date'])))
		.y(d => yScale(d['record_min_temp']))

		svg.selectAll('.min-line')
		.data([data])
		.join('path')
		.transition()
		.attr('class', 'min-line')
		.style('fill', 'none')
		.style('stroke', 'royalblue')
		.style('stroke-width', 1)
		.duration(600)
		.attr('d', minLineFunc)

		svg.append('g')
		.attr('class', 'axis')
		.attr('transform', `translate(${margin.left}, 0)`)
		.call(d3.axisLeft().scale(yScale))

		svg.append('text')
		.text('Temperature')
		.attr('class', 'axis')
		.attr('transform', `translate(${margin.left - 35}, ${margin.top + height/2})rotate(-90)`)
		.style('text-anchor', 'middle')
		.style('font-size', 14)

		svg.append('g')
		.attr('class', 'axis')
		.attr('transform', `translate(0, ${margin.top + height})`)
		.call(d3.axisBottom().scale(timeScale).ticks(13).tickFormat(d => d3.timeFormat('%m')(d)))

		svg.append('text')
		.text('Date')
		.attr('class', 'axis')
		.attr('transform', `translate(${margin.left + width/2}, ${margin.top + height + 40})`)
		.style('text-anchor', 'middle')
		.style('font-size', 14)

		// calculate average precipatation each month
		for (let i = 0; i < data.length; i++) {
			data[i]['month'] = `${data[i]['date'].split('-')[0]}-${data[i]['date'].split('-')[1]}`
			}
			
			let groupedData = d3.groups(data, d => d['month'])
			
	        for (group of groupedData) {
	            let average = d3.mean(group[1], d => d['actual_precipitation']).toFixed(2)
	            group.push(average)
	        }
			
			        let rScale = d3.scaleLinear()
			        .domain(d3.extent(groupedData, d => d[2]))
			        .range([8, 18])
			
			        let groups = svg.selectAll('.group')
			        .data(groupedData)
			        .join('g')
			        .attr('class', 'group')
			        .attr('transform', d => `translate(${timeScale(new Date(`${d[0]}-1`)) + width/12/2}, ${margin.top + height - rScale(d[2])})`)
			        
			
			        let circle = groups.selectAll('circle')
			        .data(d => [d])
			        .join('circle')
			        .style('opacity', showCircles ? 1 : 0)
			        .style('fill', 'lightblue')
			        .style('fill-opacity', 0.75)
			        .on('mouseover', function() {
			            d3.select(this.nextSibling).style('visibility', 'visible')
			        })
			        .on('mouseout', function() {
			            d3.selectAll('.text').style('visibility', 'hidden')
			        })
			        .transition()
			        .duration(600)
			        .attr('r', d => rScale(d[2]))
			
			        let texts = groups.selectAll('.text')
			        .data(d => [d])
			        .join('text')
			        .text(d => d[2])
			        .attr('y', 4)
			        .attr('class', 'text')
			        .style('font-size', 10)
			        .style('text-anchor', 'middle')
			        .style('cursor', 'default')
			        .style('visibility', 'hidden')
			        .on('mouseover', function() {
			            d3.select(this).style('visibility', 'visible')
			        })
			        .on('mouseout', function() {
			            d3.select(this).style('visibility', 'hidden')
			        })
	})
}