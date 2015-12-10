/* global canvas, app */
import React from 'react'
import ReactDOM from 'react-dom'
import request from 'request'
import paper from 'paper/dist/paper-full'

class App extends React.Component {
  constructor (props) {
    super(props)

    // Store skintones
    this.skintones = [
      '#f9da9d',
      '#d8ae84',
      '#664d3c'
    ]

    // Set state
    this.state = {
      currentColor: 0
    }

    // Bind methods
    this.resetLogo = this.resetLogo.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.regenerateSegments = this.regenerateSegments.bind(this)
  }

  resetLogo () {
    this.regenerateSegments(10)
  }

  regenerateSegments (width) {
    let logo = window.paper.project.layers[0] ? window.paper.project.layers[0].children['logo'] : false
    if (typeof width !== 'number') {
      this.setState({
        currentColor: this.skintones[Math.floor(Math.random() * this.skintones.length)]
      })
    }

    logo.children.map((segment) => {
      // Store old state, generate a new one
      let oldWidth = segment.strokeWidth
      let newWidth = typeof width === 'number' ? width : Math.random() * 50 + 3

      // Set a color
      segment.strokeColor = this.state.currentColor

      // Animate until the values are correct
      segment.onFrame = (event) => {
        if (segment.strokeWidth > newWidth && oldWidth > newWidth) {
          segment.strokeWidth *= 0.9
        } else if (segment.strokeWidth < newWidth && oldWidth < newWidth) {
          segment.strokeWidth *= 1.1
        } else {
          segment.strokeWidth = newWidth
          segment.onFrame = () => {}
        }
      }
    })
    paper.view.update()
  }

  handleClick (segment, event) {
    this.randomizeSegment(segment, false)
  }

  randomizeSegment (segment, loop) {
    let oldWidth = segment.strokeWidth
    let newWidth = Math.random() * 50 + 3

    segment.onFrame = (event) => {
      // If we're increasing in size
      if (newWidth > oldWidth && segment.strokeWidth < newWidth) {
        segment.strokeWidth *= 1.1
      // If we're decreasing in size
      } else if (newWidth < oldWidth && segment.strokeWidth > newWidth) {
        segment.strokeWidth *= 0.9
      } else if ((newWidth < oldWidth && segment.strokeWidth <= newWidth) ||
        (newWidth > oldWidth && segment.strokeWidth >= newWidth)) {
        // If we want to loop, just pick a new random value
        if (loop) {
          newWidth = Math.random() * 50 + 3
        // Otherwise, unbind this function
        } else {
          segment.onFrame = () => {}
        }
      }
    }
  }

  componentWillMount () {
    window.paper = paper.setup(canvas)
    paper.project.importSVG('./assets/htb_grainy.svg', (logo) => {
      // Place the logo 50px from the corner
      logo.name = 'logo'
      logo.pivot = logo.bounds.topLeft
      logo.position = new paper.Point(50, 50)

      // Bind mouse events
      logo.children.map((segment) => {
        segment.on('click', (event) => {
          this.handleClick(segment, event)
        })
        segment.on('mouseenter', (event) => {
          segment.opacity = 0.8
        })
        segment.on('mouseleave', (event) => {
          segment.opacity = 1
        })
      })

      // Give all segments a color and stroke width
      this.regenerateSegments()
    })
  }

  render () {
    return (
      <section>
        <p><button onClick={this.regenerateSegments}>Regenerate</button></p>
        <p><button onClick={this.resetLogo}>Strip</button></p>
      </section>
    )
  }
}

ReactDOM.render(<App />, app)
