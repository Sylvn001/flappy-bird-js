function newElement(tagName, className){
  const elememt = document.createElement(tagName);
  elememt.className = className
  return elememt
}

function Barrier(reverse = false)
{
  this.element = newElement('div', 'barrier')

  const border = newElement('div' , 'b-border')
  const body = newElement('div' , 'b-body')

  this.element.appendChild(reverse ? body : border)
  this.element.appendChild(reverse ? border : body)

  this.setHeight = height => body.style.height = `${height}px`

}

function Barriers (height, opening, x){
  this.element = newElement('div', 'barriers')

  this.top = new Barrier(true)
  this.bottom = new Barrier(false)

  this.element.appendChild(this.top.element)
  this.element.appendChild(this.bottom.element)

  this.sortOpening = () => {
    const topHeight = Math.random() * (height - opening)
    const bottomHeight = height - opening - topHeight

    this.top.setHeight(topHeight)
    this.bottom.setHeight(bottomHeight)

  }

  this.getX = () => parseInt(this.element.style.left.split('px')[0])
  this.setX = x => this.element.style.left = `${x}px`
  this.getWidth = () => this.element.clientWidth

  this.sortOpening()
  this.setX(x)

}

function BarrierFactory(height, width, opening, distance, notificationPoint){
  this.pairs = [
    new Barriers(height, opening, width),
    new Barriers(height, opening, width + distance),
    new Barriers(height, opening, width + distance * 2),
    new Barriers(height, opening, width + distance * 3),
  ]

  const offset = 3

  this.animation = () => {
    this.pairs.forEach(pair => {
      pair.setX(pair.getX() - offset)

      if(pair.getX() < -pair.getWidth()){
        pair.setX(pair.getX() + distance * this.pairs.lenght)
        pair.sortOpening()
      }

      const center = width / 2
      const centerFlag = pair.getX() + offset >= center && pair.getX() < center

      if(centerFlag)
        notificationPoint()
    })
  }

}

function Bird(gameHeight){
  let flying = false;

  this.element = newElement('img', 'bird')
  this.element.src = "img/bird.png"

  this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
  this.setY = y => this.element.style.bottom = `${y}px`

  window.onkeydown = e => flying = true
  window.onkeyup = e => flying = false

  this.animation = () => {
    const newY = this.getY() + (flying ? 8 : -5)
    const maxHeight = gameHeight - this.element.clientHeight

    if(newY <= 0)
      this.setY(0)
    else
      if (newY >= maxHeight)
        this.setY(maxHeight)
      else
        this.setY(newY)

  }

  this.setY(gameHeight / 2)

}

function Progress(){
  this.element = newElement("span", 'progress')

  this.updatePontuation = points => {
    this.element.innerHTML = points
  }

  this.updatePontuation(0)
}

function isOverlaid(elementA, elementB){
  const a = elementA.getBoundingClientRect()
  const b = elementB.getBoundingClientRect()

  const x = a.left + a.width >= b.left && b.left + b.width >= a.left
  const y = a.top + a.height >= b.top && b.top + b.height >= a.top

  return x && y
}

function colision(bird, barriers){
  let hasColision = false

  barriers.pairs.forEach(barrierPair => {
    if(!hasColision)
    {
      const top = barrierPair.top.element
      const bottom = barrierPair.bottom.element
      hasColision = isOverlaid(bird.element, top) || isOverlaid(bird.element, bottom)
    }
  })

  return hasColision
}

function FlappyBird(){
  let points = 0

  const gameArea = document.querySelector('[wm-flappy]')
  const height = gameArea.clientHeight
  const width = gameArea.clientWidth

  const progress = new Progress()
  const barriers = new BarrierFactory(height, width, 200, 400, () => progress.updatePontuation(++points))
  const bird = new Bird(height)

  gameArea.appendChild(progress.element)
  gameArea.appendChild(bird.element)
  barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))


  this.start = () => {
    const timer = setInterval(() => {
      barriers.animation()
      bird.animation()

      if(colision(bird, barriers)){
        clearInterval(timer)
      }

    }, 20)
  }

}

new FlappyBird().start()