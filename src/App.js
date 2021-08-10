import styled from 'styled-components';
import './App.css';
import { useEffect, useState } from 'react';
import { white } from 'chalk';
import { debounce } from 'debounce';

// NOTE: done in 45 minutes.

const Wrapper = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GameWrapper = styled.div`
  position: relative;
`;

const Row = styled.div`
  display: flex;
  gap: 15px;
`;

const BoardRow = styled.div`
  display: flex;
  width: 500px;
`;

const StyledSteps = styled.div`
  position: absolute;
  right: -200px;
  top: 15px;
`

const getBackground = (isSelected, isEven) => {
  if (isSelected) {
    return 'silver'
  }

  if (isEven) {
    return 'gray';
  }

  return white;
}

const Box = styled.div(({ $size, $isSelected, $isEven }) => `
  background: ${getBackground($isSelected, $isEven)};
  width: ${$size}px;
  height: ${$size}px;
  border: 1px solid black;
`)

const Settings = ({
  onBoardSizeChange,
  onAvailableStepsChange,
  config,
  onSubmit
}) => {
  return (
    <>
      <Row>
        <label>Chess board size</label>
        <input value={config.boardSize} onChange={onBoardSizeChange} />
      </Row>
      <Row>
        <label>Number of available steps</label>
        <input value={config.steps} onChange={onAvailableStepsChange} />
      </Row>
      <button onClick={onSubmit}>OK</button>
    </>
  )
}

const Game = ({ config, steps, onStep, current }) => {
  const arr = (new Array(config.boardSize)).fill(true).map((_, index) => index);

  useEffect(() => {
    const handler = debounce((e) => {
      if (e.key === "ArrowUp" && current[1] !== 0) {
        onStep(current[0], current[1] - 1)
      }
      if (e.key === "ArrowDown" && current[1] !== arr.length - 1) {
        onStep(current[0], current[1] + 1)
      }
      if (e.key === "ArrowLeft" && current[0] !== 0) {
        onStep(current[0] - 1, current[1])
      }
      if (e.key === "ArrowRight" && current[0] !== arr.length - 1) {
        onStep(current[0] + 1, current[1])
      }
    }, 100);

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    }
  }, [arr.length, current, onStep]);

  return (
    <GameWrapper>
      <StyledSteps>
        Steps left: {config.steps - steps.length}/{config.steps}
      </StyledSteps>
      {arr.map(y => (
        <BoardRow key={y}>
          {arr.map(x => (
            <Box
              key={x}
              $isSelected={current[0] === x && current[1] === y}
              $isEven={(x - y) % 2 === 0} $size={500 / arr.length}
              onClick={() => onStep(x, y)}
            />
          ))}
        </BoardRow>
      ))}
    </GameWrapper>
  )
}

const Results = ({ steps, onReset }) => {
  const results = `[${steps.map(([x, y]) => `{${x},${y}}`).join()}]`
  return (
    <div>
      <h2>Thank you! Your steps:</h2>
      {results}
      <button onClick={onReset}>
        START OVER
      </button>
    </div>
  )
}

const screens = {
  Settings: 'settings',
  Game: 'game',
  Results: 'results',
}

function App() {
  const [screen, setScreen] = useState(screens.Settings)
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(null)
  const [config, setConfig] = useState({
    steps: 0,
    boardSize: 0,
  })

  const handleStart = () => {
    setSteps([]);
    const randomX = Math.ceil(Math.random() * config.boardSize) - 1
    const randomY = Math.ceil(Math.random() * config.boardSize) - 1
    setCurrent([randomX, randomY])
    setScreen(screens.Game)
  }

  useEffect(() => {
    if (config.steps !== 0 && steps.length >= config.steps) {
      setScreen(screens.Results);
    }
  }, [config.steps, steps.length])

  const getComponent = () => {
    if (screen === screens.Settings) {
      const handleSize = (event) => {
        const boardSize = +event.currentTarget.value;
        setConfig(c => ({ ...c, boardSize }));
      }
      const handleSteps = (event) => {
        const steps = +event.currentTarget.value;
        setConfig(c => ({ ...c, steps }));
      }
      return (
        <Settings
          onAvailableStepsChange={handleSteps}
          onBoardSizeChange={handleSize}
          config={config}
          onSubmit={handleStart}
        />
      )
    }

    if (screen === screens.Game) {
      const handleStep = (x, y) => {
        setSteps(steps => [...steps, [x, y]]);
        setCurrent([x, y])
      }

      return (
        <Game
          config={config}
          onStep={handleStep}
          current={current}
          steps={steps}
        />
      )
    }

    if (screen === screens.Results) {
      return (
        <Results
          onReset={() => {
            setSteps([]);
            setScreen(screens.Settings);
          }}
          steps={steps}
        />
      )
    }

    return "Not found"
  }
  return (
    <Wrapper>
      {getComponent()}
    </Wrapper>
  );
}

export default App;
