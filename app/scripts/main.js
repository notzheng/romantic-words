window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

var starDensity = .216
var speedCoeff = .05
var width
var height
var starCount
var circleRadius
var circleCenter
var first = true
var giantColor = '180,184,240'
var starColor = '226,225,142'
var cometColor = '226,225,224'
var canva = document.getElementById('universe')
var universe
var stars = []

windowResizeHandler()
window.addEventListener('resize', windowResizeHandler, false)

createUniverse()

function createUniverse () {
  universe = canva.getContext('2d')

  for (var i = 0; i < starCount; i++) {
    stars[i] = new Star()
    stars[i].reset()
  }

  draw()
}

function draw () {
  universe.clearRect(0, 0, width, height)

  var starsLength = stars.length

  for (var i = 0; i < starsLength; i++) {
    var star = stars[i]
    star.move()
    star.fadeIn()
    star.fadeOut()
    star.draw()
  }

  window.requestAnimationFrame(draw)
}

function Star () {
  this.reset = function () {
    this.giant = getProbability(3)
    this.comet = this.giant || first ? false : getProbability(10)
    this.x = getRandInterval(0, width - 10)
    this.y = getRandInterval(0, height)
    this.r = getRandInterval(1.1, 2.6)
    this.dx = getRandInterval(speedCoeff, 6 * speedCoeff) + (this.comet + 1 - 1) * speedCoeff * getRandInterval(50, 120) + speedCoeff * 2
    this.dy = -getRandInterval(speedCoeff, 6 * speedCoeff) - (this.comet + 1 - 1) * speedCoeff * getRandInterval(50, 120)
    this.fadingOut = null
    this.fadingIn = true
    this.opacity = 0
    this.opacityTresh = getRandInterval(.2, 1 - (this.comet + 1 - 1) * .4)
    this.do = getRandInterval(0.0005, 0.002) + (this.comet + 1 - 1) * .001
  }

  this.fadeIn = function () {
    if (this.fadingIn) {
      this.fadingIn = this.opacity > this.opacityTresh ? false : true
      this.opacity += this.do
    }
  }

  this.fadeOut = function () {
    if (this.fadingOut) {
      this.fadingOut = this.opacity < 0 ? false : true
      this.opacity -= this.do / 2
      if (this.x > width || this.y < 0) {
        this.fadingOut = false
        this.reset()
      }
    }
  }

  this.draw = function () {
    universe.beginPath()

    if (this.giant) {
      universe.fillStyle = 'rgba(' + giantColor + ',' + this.opacity + ')'
      universe.arc(this.x, this.y, 2, 0, 2 * Math.PI, false)
    } else if (this.comet) {
      universe.fillStyle = 'rgba(' + cometColor + ',' + this.opacity + ')'
      universe.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, false)

      // comet tail
      for (var i = 0; i < 30; i++) {
        universe.fillStyle = 'rgba(' + cometColor + ',' + (this.opacity - (this.opacity / 20) * i) + ')'
        universe.rect(this.x - this.dx / 4 * i, this.y - this.dy / 4 * i - 2, 2, 2)
        universe.fill()
      }
    } else {
      universe.fillStyle = 'rgba(' + starColor + ',' + this.opacity + ')'
      universe.rect(this.x, this.y, this.r, this.r)
    }

    universe.closePath()
    universe.fill()
  }

  this.move = function () {
    this.x += this.dx
    this.y += this.dy
    if (this.fadingOut === false) {
      this.reset()
    }
    if (this.x > width - (width / 4) || this.y < 0) {
      this.fadingOut = true
    }
  }(function () {
    setTimeout(function () {
      first = false
    }, 50)
  })()
}

function getProbability (percents) {
  return ((Math.floor(Math.random() * 1000) + 1) < percents * 10)
}

function getRandInterval (min, max) {
  return (Math.random() * (max - min) + min)
}

function windowResizeHandler () {
  width = window.innerWidth
  height = window.innerHeight
  starCount = width * starDensity
  // console.log(starCount)
  circleRadius = (width > height ? height / 2 : width / 2)
  circleCenter = {
    x: width / 2,
    y: height / 2
  }

  canva.setAttribute('width', width)
  canva.setAttribute('height', height)
}

var Clock = (function () {
  var canvas,
    ctx,
    bgGrad = true,
    gradient,
    height = 400,
    key = {
      up: false,
      shift: false
    },
    particles = [],
    // particleColor = 'hsla(0, 0%, 100%, 0.3)',
    mouse = {
      x: 0,
      y: 0
    },
    press = false,
    quiver = true,
    texts = ['蔚蓝星空下', '男孩独自坐望', '星海闪烁', '仿佛在问', '为什么你一个人', '我在等一个人', '一个女孩', '这个女孩', '真没什么好的', '性格很倔强', '脾气又不好', '还很强势', '但男孩觉得', '这都是表面', '在他的眼中', '女孩任性起来', '耍起混来的时候', '真的很可爱', '可是', '就是这样的她', '也非常的脆弱', '也有', '伤心难过的时候', '而男孩', '看着她', '想要做一千件事', '让她开心起来', '却总是放下', '已经攥紧的拳头', '空荡荡', '因为男孩知道', '女孩心中有个人', '那是一座女孩', '筑起的城堡', '男孩走不近', '只能呆呆望着', '其实他也知道', '这样很傻', '但是放下', '却做不到', '在城堡外', '继续等待', '男孩再次抬头', '望向星空', '嘿', '女孩', '我能成为', '你的星星吗', '小小的星光', '不过分炙热', '不会灼伤你', '让你耍赖', '给你依赖', '给你幸福', '等待着你', 'Always'],

    text = texts[0],
    textNum = 0,
    textSize = 60,
    valentine = false,
    msgTime = 100,
    updateColor = true,
    width = 420

  var FRAME_RATE = 60,
    MIN_WIDTH = 0,
    MIN_HEIGHT = 0,
    PARTICLE_NUM = 1200,
    RADIUS = Math.PI * 2

  var defaultStyles = function () {
    // textSize = 36
    // particleColor = 'rgba(226,225,142, 0.7)'
  }

  var draw = function (p) {
    ctx.fillStyle = 'rgba(226,225,142, ' + p.opacity + ')'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, RADIUS, true)
    ctx.closePath()
    ctx.fill()
  }

  var loop = function () {
    ctx.clearRect(0, 0, width, height)
    // textSize = 36

    ctx.fillStyle = 'rgb(255, 255, 255)'
    ctx.textBaseline = 'middle'
    ctx.font = textSize + "px 'Avenir', 'Helvetica Neue', 'Arial', 'sans-serif'"
    ctx.fillText(text, (width - ctx.measureText(text).width) * 0.5, height * 0.5)

    var imgData = ctx.getImageData(0, 0, width, height)

    ctx.clearRect(0, 0, width, height)

    for (var i = 0, l = particles.length; i < l; i++) {
      var p = particles[i]
      p.inText = false
    }
    particleText(imgData)
  }

  var pad = function (number) {
    return ('0' + number).substr(-2)
  }

  var particleText = function (imgData) {
    var pxls = []
    for (var w = width; w > 0; w -= 3) {
      for (var h = 0; h < width; h += 3) {
        var index = (w + h * (width)) * 4
        if (imgData.data[index] > 1) {
          pxls.push([w, h])
        }
      }
    }

    var count = pxls.length
    var j = parseInt((particles.length - pxls.length) / 2, 10)
    if (j < 0) {
      j = 0
    }

    for (var i = 0; i < pxls.length && j < particles.length; i++, j++) {
      try {
        var p = particles[j],
          X,
          Y

        if (quiver) {
          X = (pxls[count - 1][0]) - (p.px + Math.random() * 5)
          Y = (pxls[count - 1][1]) - (p.py + Math.random() * 5)
        } else {
          X = (pxls[count - 1][0]) - p.px
          Y = (pxls[count - 1][1]) - p.py
        }
        var T = Math.sqrt(X * X + Y * Y)
        var A = Math.atan2(Y, X)
        var C = Math.cos(A)
        var S = Math.sin(A)
        p.x = p.px + C * T * p.delta
        p.y = p.py + S * T * p.delta
        p.px = p.x
        p.py = p.y
        p.inText = true
        p.fadeIn()
        draw(p)
        if (key.up === true) {
          p.size += 0.3
        } else {
          var newSize = p.size - 0.5
          if (newSize > p.origSize && newSize > 0) {
            p.size = newSize
          } else {
            p.size = m.origSize
          }
        }
      } catch (e) {}
      count--
    }
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i]
      if (!p.inText) {
        // p.px = p.mx
        // p.py = p.my
        // p.opacity = 1
        p.fadeOut()

        var X = p.mx - p.px
        Y = p.my - p.py

        var T = Math.sqrt(X * X + Y * Y)

        var A = Math.atan2(Y, X)

        var C = Math.cos(A)

        var S = Math.sin(A)

        p.x = p.px + C * T * p.delta / 2
        p.y = p.py + S * T * p.delta / 2
        p.px = p.x
        p.py = p.y

        draw(p)
      }
    }
  }

  var setDimensions = function () {
    // width = window.innerWidth
    // height = window.innerHeight

    canvas.width = window.innerWidth >= 420 ? 420 : width
    canvas.height = window.innerHeight >= 150 ? 150 : height

    width = canvas.width
    height = canvas.height

    canvas.style.position = 'absolute'
    canvas.style.left = '0px'
    canvas.style.top = '0px'
    canvas.style.bottom = '0px'
    canvas.style.right = '0px'
    canvas.style.marginTop = window.innerHeight * .15 + 'px'
  }

  var setGradient = function (gradientStops) {
    gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width)

    for (var position in gradientStops) {
      var color = gradientStops[position]
      gradient.addColorStop(position, color)
    }
  }

  /** 
   * Public Methods
   */
  return {
    init: function (canvasID) {
      canvas = document.getElementById(canvasID)
      if (canvas === null || !canvas.getContext) {
        return
      }
      ctx = canvas.getContext('2d')
      setDimensions()
      this.event()

      for (var i = 0; i < PARTICLE_NUM; i++) {
        particles[i] = new Particle(canvas)
      }

      setInterval(loop, FRAME_RATE)
    },

    event: function () {
      var end = false
      console.log(texts.length)
      document.addEventListener('click', function (e) {
        textNum++
        if (textNum >= texts.length) {
          textNum--
          end = true
          return
        }
        text = texts[textNum]
        console.log(textNum)
      }, false)
    }
  }
})()

var Particle = function (canvas) {
  var range = Math.random() * 180 / Math.PI,
    spread = canvas.height / 4,
    size = Math.random() * 1.2

  this.delta = 0.15
  this.x = 0
  this.y = 0

  this.px = (canvas.width / 2) + ((Math.random() - 0.5) * canvas.width)
  this.py = (canvas.height * 0.5) + ((Math.random() - 0.5) * spread)

  this.mx = this.px
  this.my = this.py

  this.velocityX = Math.floor(Math.random() * 10) - 5
  this.velocityY = Math.floor(Math.random() * 10) - 5

  this.size = size
  this.origSize = size

  this.inText = false

  this.opacity = 0
  this.do = 0.02

  this.opacityTresh = 0.98
  this.fadingOut = true
  this.fadingIn = true
  this.fadeIn = function () {
    this.fadingIn = this.opacity > this.opacityTresh ? false : true
    if (this.fadingIn) {
      this.opacity += this.do
    } else {
      this.opacity = 1
    }
  }

  this.fadeOut = function () {
    this.fadingOut = this.opacity < 0 ? false : true
    if (this.fadingOut) {
      this.opacity -= 0.06
      if (this.opacity < 0) {
        this.opacity = 0
      }
    } else {
      this.opacity = 0
    }
  }
}

// mp3.play()
setTimeout(function () {
  Clock.init('canvas')
}, 2000)
