import { useRef, useState, useEffect } from 'react'
import './App.css'

const GRAVITY = 0.5

const onStartup = () => {
  // Check for local storage
  if (localStorage.getItem('fb-best') !== null) {
    return +JSON.parse(localStorage.getItem('fb-best')!)
  }

  return 0
}

function App() {
  // state
  const intervalId = useRef<NodeJS.Timer | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [position, setPosition] = useState(300)
  const [score, setScore] = useState<number>(0)
  const [best, setBest] = useState<number>(onStartup())
  const [deltaY, setDeltaY] = useState(GRAVITY)
  const [baseX, setBaseX] = useState(0)
  const [pipe1X, setPipe1X] = useState(500)
  const [pipe2X, setPipe2X] = useState(500)
  const [randHeight1, setRandHeight1] = useState(0)
  const [randHeight2, setRandHeight2] = useState(150)
  const [startGame, setStartGame] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  

  useEffect(() => {
      // Default canvas startup
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')

        if (ctx) {
          const bgImage = document.getElementById('bg') as HTMLCanvasElement
          const base = document.getElementById('base') as HTMLCanvasElement
          const message = document.getElementById('msg') as HTMLCanvasElement
          // const birdImage = document.getElementById('bird-mf') as HTMLCanvasElement
          ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
          // draw background
          ctx?.drawImage(bgImage, 0, -50, bgImage.width * 10, bgImage.height * 1.5)
          // draw bases and connect them
          ctx?.drawImage(base, baseX, 550)
          ctx?.drawImage(base, baseX + 336, 550)
          // Draw tap message
          ctx?.save()
          ctx?.scale(1.25, 1.25)
          ctx?.drawImage(message, 100, 100)
          ctx?.restore()
        }
      }
  }, [])


  useEffect(() => {
    // Start counter once user starts or resets game
    if (startGame) {
      intervalId.current = setInterval(() => runGame(), 16)
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [startGame, position, deltaY])

  // Main animation loop
  const runGame = () => {
    if (position <= 525 && !gameOver) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')

        if (ctx) {
          // Grab images
          const bgImage = document.getElementById('bg') as HTMLCanvasElement
          const base = document.getElementById('base') as HTMLCanvasElement
          const pipe = document.getElementById('pipe') as HTMLCanvasElement
          let birdImage
          ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
          ctx?.drawImage(bgImage, 0, -50, bgImage.width * 10, bgImage.height * 1.5)

          // Render different bird image based on its deltaY
          if (deltaY > 7) {
            birdImage = document.getElementById('bird-df') as HTMLCanvasElement
          } else if (deltaY < 7 && deltaY > 0) {
            birdImage = document.getElementById('bird-mf') as HTMLCanvasElement
          } else {
            birdImage = document.getElementById('bird-uf') as HTMLCanvasElement
          }
          // Rotate bird based on its deltaY
          ctx?.save()
          ctx?.translate(180 + (35 * (14 / 9)) / 2, position + 35 / 2)
          ctx?.rotate(deltaY / -15)
          ctx?.drawImage(birdImage, -(35 * (14 / 9)) / 2, -35 / 2, 35 * (14 / 9), 35)
          ctx?.restore()

          
          // Render pipe as long as its on the screen
          if (pipe1X > -100) {
            ctx?.save()
            ctx?.scale(1.5, 1.5)
            ctx?.translate(pipe1X + pipe.width / 2, pipe.height / 2)
            ctx?.rotate(Math.PI)
            ctx?.drawImage(pipe, -pipe.width / 2, -pipe.height / 2 + 125 + randHeight1)
            ctx?.restore()

            ctx?.save()
            ctx?.scale(1.5, 1.5)
            ctx?.drawImage(pipe, pipe1X, 300 - randHeight1)
            ctx?.restore()
          }

          // Render pipe as long as its on the screen and 1st pipe is halfway down screen
          if ((pipe1X < 350 || pipe2X < 300) && pipe2X > -100) {
            ctx?.save()
            ctx?.scale(1.5, 1.5)
            ctx?.translate(pipe2X + pipe.width / 2, pipe.height / 2)
            ctx?.rotate(Math.PI)
            ctx?.drawImage(pipe, -pipe.width / 2, -pipe.height / 2 + 125 + randHeight2)
            ctx?.restore()

            ctx?.save()
            ctx?.scale(1.5, 1.5)
            ctx?.drawImage(pipe, pipe2X, 300 - randHeight2)
            ctx?.restore()
          }

          // Ground loop
          if (baseX <= -192) {
            setBaseX(0)
          }
          ctx?.drawImage(base, baseX, 550)
          ctx?.drawImage(base, baseX + 336, 550)
        }
      }

      // Gravity for bird
      setPosition((prevPos) => prevPos - deltaY)
      // Set a terminal velocity
      if (deltaY > -15) {
        setDeltaY((prevDelX) => prevDelX - GRAVITY / 0.666)
      }
      // Set base speed
      setBaseX((prevBaseX) => prevBaseX - GRAVITY * 8)
      if (pipe1X > -100) {
        setPipe1X((prevPipeX) => prevPipeX - GRAVITY * 5.3333)
      } else {
        setPipe1X(333)
        setRandHeight1(Math.floor(Math.random() * 150))
      }

      // Once the first pipe is past the middle, start moving the 2nd pipe
      if (pipe1X < 285 || pipe2X < 300) {
        if (pipe2X > -100) {
          setPipe2X((prevPipeX) => prevPipeX - GRAVITY * 5.33333)
        } else {
          setPipe2X(333)
          setRandHeight2(Math.floor(Math.random() * 150))
        }
      }


      // Increment score once bird passes through pipe
      if (Math.round(pipe1X) === 129 || Math.round(pipe1X) === 130 || Math.round(pipe2X) === 129 || Math.round(pipe2X) === 130) {
        if (score !== null) {
          setScore(score + 1)
        }
      }


      // Game over if birds x and y position cross pipe
      if (Math.round(pipe1X) < 156 && Math.round(pipe1X) > 71) {
        if (position > 415 - randHeight1 * 1.5) {
          handleGameOver()
        }

        if (position < 295 - randHeight1 * 1.5) {
          handleGameOver()
        }
      }

      // Game over if birds x and y position cross pipe
      if (Math.round(pipe2X) < 156 && Math.round(pipe2X) > 71) {
        if (position > 415 - randHeight2 * 1.5) {
          handleGameOver()
        }

        if (position < 295 - randHeight2 * 1.5) {
          handleGameOver()
        }
      }


    } else {
      // Clear interval if game over
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
      handleGameOver()
    }
  }

  const jump = () => {
    // Set a cap to the height a user can jump
    if (position > -100) {
      // Set deltaY to positive number to make velocity positive
      setDeltaY(GRAVITY * 20)
      // Add deltaY to the position
      setPosition((prevPos) => prevPos + deltaY)
    }
  }

  const handleEvent = () => {
    // Start the game on click if first run
    if (!startGame && !gameOver) {
      setStartGame(true)
      setScore(0)
    }

    jump()
  }

  const handleGameOver = () => {
    // Set new best
    if (score > best) {
      setBest(score)
      localStorage.setItem('fb-best', JSON.stringify(score))
    }
    setStartGame(false)
    setGameOver(true)
    setPipe1X(500)
    setPipe2X(500)
  }

  const handleReset = () => {
      setStartGame(true)
      setGameOver(false)
      setScore(0)
      setPosition(300)
  }


  return (
    <div onKeyDown={handleEvent} onClick={handleEvent} className='game-wrapper'>
      <img src={require('./images/background-day.png')} id='bg' width='50' style={{ display: 'none' }} />
      <img src={require('./images/base.png')} id='base' width='50' style={{ display: 'none' }} />
      <img src={require('./images/message.png')} id='msg' width='50' style={{ display: 'none' }} />
      <img src={require('./images/pipe-green.png')} id='pipe' width='50' style={{ display: 'none' }} />
      <img src={require('./images/yellowbird-upflap.png')} id='bird-uf' width='50' style={{ display: 'none' }} />
      <img src={require('./images/yellowbird-midflap.png')} id='bird-mf' width='50' style={{ display: 'none' }} />
      <img src={require('./images/yellowbird-downflap.png')} id='bird-df' width='50' style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={480} height={640} />
      {startGame && <div className='score'>{score}</div>}
      {gameOver &&
        <div className='end-game-popup'>
          <div className='game-over-scores'>
            <div className='text'>SCORE:</div>
            <div className='text'>{score}</div>
            <br />
            <div className='text'>BEST:</div>
            <div className='text'>{best}</div>
          </div>
          <button className='restart' onClick={handleReset}>RESTART</button>
        </div>
      }
    </div>
  )
}

export default App
