const margin = {
  top: 100,
  right: 20,
  bottom: 80,
  left: 60
}
const width = 1500;
// console.log(width)
const height = 600;
const bar = ({
  width: 8,
  padding: 2
})

let rawData = []
let voteChoose = 'Coach';
let pointsChoose = [1, 3, 5]
let sexChoose = "Men's"
let typeChoose = 'Player'

const color1 = "#fecc50"
const color2 = "#0be7fb"
const color3 = "#ff6d69"



const svg = d3.select('body')
  .select('.viz')
  .append('svg')
svg.attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)


const updateChart = (vote, points, sex, type) => {
  let pointsForFilter = (points != 'All' ? points : [1, 3, 5])
  // console.log(pointsForFilter)

  let winners = {
    "Men's": {
      Player: 'Robert Lewandowski',
      Coach: 'JÜRGEN KLOPP'
    },
    "Women's": {
      Player: 'LUCY BRONZE',
      Coach: 'SARINA WIEGMAN'
    }
  }

  // console.log(winners[sex])


  d3.select('.winner')
    // .data(['Kuba'])
    .style('opacity', function () {
      let current = (this._current)
      return current == winners[sex][type] ? 1 : 0

    })
    .property('_current', winners[sex][type])
    .transition()
    .duration(1750)
    .ease(d3.easeCircle)
    .style('opacity', 1)
    .text(winners[sex][type])

  const nodes = rawData
    .filter(d => d.Vote == vote)
    .filter(d => pointsForFilter.includes(d.Points))
    .filter(d => d.Sex == sex)
    .filter(d => d.Type == type)

  let Candiadates = new Set()
  nodes.forEach(d => Candiadates.add(d.Candidate))
  Candiadates = Array.from(Candiadates).sort()

  xCenterScale
    .domain(Candiadates)

  const totalPoints = d3.rollup(nodes, v => d3.sum(v, e => e.Points), d => d.Candidate)


  const maxValue = d3.max(Array.from(totalPoints), d => d[1])
  const minmaxValue = d3.extent(Array.from(totalPoints), d => d[1])

  yScaleScatter
    .domain([0, maxValue])


  rScale.domain(minmaxValue)

  const linesData = generateLinks(nodes, totalPoints)

  createLinks(linesData)

  createCircle(totalPoints)
  createPlayerLabels(totalPoints)
  // createPlayerLabels2(totalPoints)
}


const voteMenu = document.querySelector('.vote')
const pointsMenu = document.querySelector('.points')
const genderMenu = document.querySelector('.menu__gender')
const typeMenu = document.querySelector('.menu__type')

voteMenu.addEventListener('click', function (event) {
  if (event.target.className == 'vote') {
    return
  }
  // console.log(event.target.className)
  Array.from(voteMenu.children).forEach(e => e.classList.remove('active'))
  event.target.classList.add('active')
  voteChoose = event.target.textContent
  updateChart(voteChoose, pointsChoose, sexChoose, typeChoose)
})

pointsMenu.addEventListener('click', function (event) {

  if (event.target.className == 'points') {
    return
  }
  Array.from(pointsMenu.children).forEach(e => e.classList.remove('active'))
  event.target.classList.add('active')
  pointsChoose = event.target.textContent

  // console.log(pointsChoose)
  updateChart(voteChoose, pointsChoose, sexChoose, typeChoose)
})

genderMenu.addEventListener('click', function (event) {
  if (event.target.className == 'menu__gender') {
    return
  }

  Array.from(genderMenu.children).forEach(e => e.classList.remove('active'))
  event.target.classList.add('active')

  sexChoose = event.target.textContent
  updateChart(voteChoose, pointsChoose, sexChoose, typeChoose)
})
typeMenu.addEventListener('click', function (event) {
  if (event.target.className == 'menu__type') {
    return
  }

  Array.from(typeMenu.children).forEach(e => e.classList.remove('active'))
  event.target.classList.add('active')

  typeChoose = event.target.textContent
  updateChart(voteChoose, pointsChoose, sexChoose, typeChoose)
})



const yScaleScatter = d3.scaleLinear()
  // .domain([0, maxValue])
  .range([height - 100, 0]);

const rScale = d3.scaleLinear()
  // .domain(minmaxValue)
  .range([4, 50])

const xCenterScale = d3.scaleBand()
  .range([0, width])
// .domain(Candiadates)
const colorScale = d3.scaleLinear()
  // .domain(minmaxValue)
  .range(["grey", "gold"]);

const xAxis = d3.scaleBand()
  .range([0, width])
// .domain(Countries)

const link = d3.linkHorizontal()
  .source(d => d.source)
  .target(d => d.target)

const createCircle = (data) => {

  circle
    .selectAll('circle')
    .data(data, d => d[0])
    .join(enter => enter.append('circle')
      .attr('cx', d => xCenterScale(d[0]))
      .attr('cy', d => yScaleScatter(d[1]))
      .attr('r', d => 1)
      // .style('stroke', '#E78D1E')

      // .style('fill', d => colorScale(d[1]))
      .style('fill', '#0a6a77')
      // .style('fill-opacity', .7)
      .call(enter => enter.transition()
        .duration(3000)
        .delay((d, i) => i * 100)
        // .attr('r', d => rScale(d[1]))
        .attr('r', d => rScale(d[1]))
        // .attr('opacity', 1)
      ),
      update =>
      update.call(update => update.transition()
        .duration(1750)
        .delay((d, i) => i * 10)
        .ease(d3.easeCircle)
        .attr('cx', d => xCenterScale(d[0]))
        .attr('cy', d => yScaleScatter(d[1]))
        .attr('r', d => rScale(d[1]))))
    .on('mouseover', function () {
      let name = d3.select(this).datum()[0]


      let countries = d3.selectAll('.link').filter(d => d.Candidate == name).data().map(d => [d.Country, d.Points])

      d3.selectAll('circle').filter(d => d[0] != name).transition().duration(400)
        // .attr("stroke", 'grey')
        .attr('opacity', 0)
      d3.selectAll('.players').filter(d => d[0] != name).transition().duration(400)
        // .attr("stroke", 'grey')
        .attr('opacity', 0)
      d3.selectAll('.players-rect').filter(d => d[0] != name).transition().duration(400)
        // .attr("stroke", 'grey')
        .attr('opacity', 0)

      // const countrySet 
      // console.log(countries)

      d3.selectAll('.link').filter(d => d.Candidate != name).transition().duration(400)
        // .attr("stroke", 'grey')
        .attr('stroke-opacity', 0.0)

      d3.selectAll('.link').filter(d => d.Candidate === name)
        .transition().duration(400)
        .attr("stroke-opacity", 1)

      d3.selectAll('.labels').filter(d => !countries.some(item => (item[0] == d)))
        // .data()
        .transition().duration(400)
        .attr("opacity", 0.2)

      d3.selectAll('.labels').filter(d => countries.some(item => (item[0] == d)))
        // .data()
        .transition().duration(400)
        .attr("font-size", 10)
        .attr("opacity", 1)
        .style('fill', d => {
          let value = countries.filter(c => c[0] === d)
          let points = (value[0][1])
          return points == 5 ? color1 :
            points == 3 ? color2 : color3
        })

    })
    .on('mouseout', function () {

      d3.selectAll('.link').transition().duration(400).attr('stroke-opacity', 0.2)

      d3.selectAll('.labels').transition().duration(400).style('fill', 'white')
        .attr("opacity", 1)
        .attr("font-size", 8)


      d3.selectAll('circle').transition().duration(400)
        // .attr("stroke", 'grey')
        .attr('opacity', 1)

      d3.selectAll('.players').transition().duration(400)
        // .attr("stroke", 'grey')
        .attr('opacity', 1)
      d3.selectAll('.players-rect').transition().duration(400)
        // .attr("stroke", 'grey')
        .attr('opacity', 1)
    })
    .classed("circle-player", true)
}

const createLinks = (data) => {
  links.selectAll(".link")
    .data(data)
    // .attr("stroke-width", .7)
    .join(enter => enter.append('path')
      // .attr("d", d => link(d)+1)
      // .call(enter => enter.transition().duration(400).delay((d,i) => i*20)
      .attr("transform", "translate(-10,10)rotate(-90)")
      .attr("d", d => (link({
        source: d.source,
        target: d.source
      })))

      .call(enter => enter.transition('createLinks').duration(750)
        .delay((d, i) => i * 4)
        .ease(d3.easeCubic)
        .attr("d", d => (link(d)))
        .attr("stroke", d => d.Points == 5 ? color1 :
          d.Points == 3 ? color2 : color3)
      ),
      update =>
      update

      .call(update => update.transition('createLinks')
        .duration(750)
        .delay((d, i) => i * 4)
        .ease(d3.easeCubic)
        .attr("d", d => (link(d)))
        .attr("stroke", d => d.Points == 5 ? color1 :
          d.Points == 3 ? color2 : color3)
      ), exit => exit.call(exit => exit.transition('createLinks')
        .duration(750)
        // .delay((d, i) => i * 4)
        .ease(d3.easeCubic)
        .attr("stroke-opacity", 0)
        .remove()
      )
    )
    // .attr("transform", d => `rotate(0, 0, 0)`)
    .attr("stroke-opacity", 0.2)
    // .attr("transform", "translate(-10,10)rotate(-90)")

    // .attr("transform", (d,i) => "translate(" + 0 + "," + 100 + ")")
    // .attr('y', -200)
    // .attr("d",d3.linkRadial()
    // .angle(d => )
    // .radius(2))


    .attr("stroke-width", 2)
    .attr('fill', 'none')
    .classed("link", true)
}


const g = svg.append('g')
  // .style("filter", "url(#gooey)")
  .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");
// .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

// d3.select('body').append('div').attr('width', width)
// .attr('height', height).classed('image', true)

const links = g.append('g').classed('links--group', true)
const circle = g.append('g').classed('players--group', true)
const playerLabels = g.append('g').classed('playersLabel--group', true)

const generateLinks = (nodes, totalPoints) => nodes.map((d, i) => {
  // const position = d.name==='ankush.nigam@novartis.com' ? [-Math.PI/2, ca] : [-Math.PI/2, 200]
  // const position = [-Math.PI/2, candidatePosition(d.name)]
  const position = [-height + 100, xAxis(d.Country) - xAxis.bandwidth() / 2]
  // const position = [Math.PI, -100]


  const newData = {
    ...d,
    source: position,
    target: [-yScaleScatter(totalPoints.get(d.Candidate)), xCenterScale(d.Candidate) + 10],


    // mid2: [x(d.level_3) ? candidatePosition(d.name) : candidatePosition(d.name) , candidatePosition(d.name)],
    // mid: [x(d.level_3) ? x(d.level_3) : xBottom(d.level_3) , height/5]
  }

  return newData
})

const createPlayerLabels = (data) => {

  const text = playerLabels
    .selectAll('.players')
    .data(data, d => d[0])
    .join(enter => enter
      // .append('div')
      .append('text')
      .classed('players', true)
      .attr('x', d => xCenterScale(d[0]))
      .attr('y', d => yScaleScatter(d[1]))
      // .text(d => `${d[0]}`)
      .call(text => text.append('tspan')
        .text(d => d[0]))
      .call(text => text.append('tspan')
        .text(d => d[1])
        .classed('player-number', true)
        .attr("dx", -30)
        .attr('dy', 20)),
      update => update.call(update => update.transition()
        .duration(400)
        .delay((d, i) => i * 10)
        .ease(d3.easeCircle)
        .attr('y', d => yScaleScatter(d[1]))
        .attr('x', d => xCenterScale(d[0]))
        .call(t => t.select('.player-number').tween('tspan', d => textTween(100, d[1])))
        // .text(d => `${d[0]}`)
      ))

  // playerLabels
  //   .data(data, d => d[0])
  //   .join(enter => enter.insert("rect", "text")
  //     .attr("width", 200)
  //     .attr("height", 200)
  //     .attr('x', 100)
  //     .attr('y', 100)
  //     .style("fill", "yellow"),
  //     update => update.insert("rect", "text")
  //     .attr("width", 200)
  //     .attr("height", 200)
  //     .attr('x', 100)
  //     .attr('y', 100)
  //     .style("fill", "yellow"))


  const formatNumber = d3.format(",d")

  function textTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    return function (t) {
      this.textContent = formatNumber(i(t));
    };
  }




}

const createPlayerLabels2 = (data) => {

  const text = playerLabels
    .selectAll('.players-rect')
    .data(data, d => d[0])
    .join(enter => enter
      // .append('div')
      .append('rect')
      .classed('players-rect', true)
      .attr('x', d => xCenterScale(d[0]))
      .attr('y', d => yScaleScatter(d[1]))
      .attr("width", d => d[0].length * 7)
      .attr("height", 4)
      .style("fill", "yellow")
      .style('fill-opacity', 0.7)
      // .text(d => `${d[0]}`)
      ,
      update => update.call(update => update.transition()
        .duration(400)
        .delay((d, i) => i * 10)
        .ease(d3.easeCircle)
        .attr('y', d => yScaleScatter(d[1]))
        .attr('x', d => xCenterScale(d[0]))
        // .call(t => t.select('.player-number').tween('tspan', d => textTween(100, d[1])))
        // .text(d => `${d[0]}`)
      ))

  // playerLabels
  //   .data(data, d => d[0])
  //   .join(enter => enter.insert("rect", "text")
  //     .attr("width", 200)
  //     .attr("height", 200)
  //     .attr('x', 100)
  //     .attr('y', 100)
  //     .style("fill", "yellow"),
  //     update => update.insert("rect", "text")
  //     .attr("width", 200)
  //     .attr("height", 200)
  //     .attr('x', 100)
  //     .attr('y', 100)
  //     .style("fill", "yellow"))


  const formatNumber = d3.format(",d")

  function textTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    return function (t) {
      this.textContent = formatNumber(i(t));
    };
  }




}



const loadData = async () => {
  try {

    rawData = await d3.dsv(';', './fifaAll.csv', d3.autoType)
    // rawData.sort((a, b) => d3.ascending(a.Country, b.Country))


    //Create set for candidates

    // console.log(Candiadates)

    //create set fir counitries, I can use it later to create axis
    let Countries = new Set()
    rawData.forEach(d => Countries.add(d.Country))
    // Countries.sort()
    // console.log('Set', Array.from(Countries).sort())

    Countries = Array.from(Countries).sort()




    xAxis.domain(Countries)




    g.append('g')
      // .attr("transform", "translate(0,650)")
      .selectAll("text")
      .data(Countries)
      .join('text')
      .attr('y', d => xAxis(d))
      .attr('x', -height + 100)
      .attr("transform", "translate(-10,10)rotate(-90)")
      .style("text-anchor", "end")
      .attr("font-size", 8)
      .style('fill', 'white')
      .text(d => d)
      .classed('labels', true)
      .on('mouseover', function () {
        let name = d3.select(this).datum()
        // console.log(name)

        d3.selectAll('.labels').filter(d => d != name).transition()
          .duration(400).attr('opacity', 0.1)

        d3.selectAll('.labels').filter(d => d == name)
          .transition('changeLabelsFontSize')
          .duration(400)
          .attr('font-size', 12)

        d3.selectAll('.link').filter(d => d.Country != name).transition().duration(400)
          // .attr("stroke", 'grey')
          .attr('stroke-opacity', 0.0)

        d3.selectAll('.link').filter(d => d.Country === name)
          .transition().duration(400)
          .attr("stroke-opacity", 1)




      })
      .on('mouseout', function () {

        d3.selectAll('.link').transition().duration(400).attr('stroke-opacity', 0.2)

        d3.selectAll('.labels').transition().duration(400).style('fill', 'white')
          .attr("opacity", 1)
          .attr('font-size', 8)
      })



    updateChart(voteChoose, pointsChoose, sexChoose, typeChoose)

    const legend = d3.select('.legend')
    // console.log(legend)

    // legend.append('g').selectAll(".legend__dot")
    //   .data([1, 3, 5])
    //   .join('circle')
    //   .attr("cx", (d, i) => {
    //     return 10 + i * 100
    //   })
    //   .attr("cy", 50)

    //   .attr("r", 7)
    //   .style('fill', d => d == 5 ? color1 :
    //     d == 3 ? color2 : color3)
    //   .classed('legend__dot', true)

    legend.append('g').selectAll(".legend__dot")
      .data([1, 3, 5])
      .join('line')
      .attr("x1", (d, i) => {
        return 5 + i * 100
      })
      .attr("y1", 50)
      .attr("x2", (d, i) => {
        return 20 + i * 100
      })
      .attr("y2", 50)

      // .attr("r", 7)
      .style('stroke', d => d == 5 ? color1 :
        d == 3 ? color2 : color3)
      .style('stroke-width', 5)
      .classed('legend__dot', true)


    legend.append('g').selectAll(".legend__text")
      .data([1, 3, 5])
      .join('text')
      .attr("x", (d, i) => {
        return 25 + i * 100
      })
      .attr("y", 50)

      .style("fill", '#FBF1DA')
      .text(d => `${d} points`)
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .classed('legend__text', true)













  } catch (err) {
    console.log(err)
  }
}

loadData()