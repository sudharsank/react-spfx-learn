// apps/react-portal/content/labs.ts

export type LabType = 'guided' | 'challenge';

export interface LabStep {
  title: string;
  instruction: string;
  hint?: string;
}

export interface LabDefinition {
  slug: string;
  title: string;
  description: string;
  type: LabType;
  duration: string;
  module: string;
  starterCode: string;
  steps?: LabStep[];
  goal?: string;
}

export const LABS: LabDefinition[] = [
  {
    slug: 'build-counter',
    title: 'Build a Counter',
    description: 'Use useState to build an interactive counter with increment, decrement, and reset.',
    type: 'guided',
    duration: '15 min',
    module: 'module-2-hooks',
    steps: [
      { title: 'Create the component', instruction: 'Define a function `App` that returns a `<div>`. Add an `<h1>` showing "Counter: 0" and three buttons: Increment, Decrement, Reset.', hint: 'Use `function App() { return <div>...</div> }` — React is already loaded for you.' },
      { title: 'Add state', instruction: 'Import `useState` from React. Add `const [count, setCount] = React.useState(0)` inside your component. Replace the "0" in your heading with `{count}`.', hint: 'React is available as a global. Try `const [count, setCount] = React.useState(0)` — no import needed here.' },
      { title: 'Wire the buttons', instruction: 'Add `onClick` handlers: Increment calls `setCount(count + 1)`, Decrement calls `setCount(count - 1)`, Reset calls `setCount(0)`.', hint: 'Use `onClick={() => setCount(count + 1)}` — arrow function inside JSX.' },
    ],
    starterCode: `function App() {
  return (
    <div style={{textAlign:'center',marginTop:'40px',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'2rem'}}>Counter: 0</h1>
      <div style={{display:'flex',gap:'12px',justifyContent:'center',marginTop:'20px'}}>
        <button>Decrement</button>
        <button>Reset</button>
        <button>Increment</button>
      </div>
    </div>
  );
}`,
  },
  {
    slug: 'todo-list',
    title: 'Build a To-Do List',
    description: 'Combine useState with lists — add and remove items dynamically.',
    type: 'guided',
    duration: '20 min',
    module: 'module-2-hooks',
    steps: [
      { title: 'Display a list', instruction: 'Create an `App` component with `const [items, setItems] = React.useState(["Buy milk", "Write code"])`. Render the items inside a `<ul>` using `.map()`.', hint: '`items.map((item, i) => <li key={i}>{item}</li>)`' },
      { title: 'Add new items', instruction: 'Add an `<input>` and an "Add" button. Store the input value in a second state variable (`inputVal`). On button click, append it to `items`.', hint: '`setItems([...items, inputVal])` — spread the existing items, add the new one.' },
      { title: 'Remove items', instruction: 'Add a "×" button inside each `<li>`. On click, filter out that item by index: `setItems(items.filter((_, idx) => idx !== i))`.', hint: '`items.filter((_, idx) => idx !== i)` — keeps everything except the clicked index.' },
    ],
    starterCode: `function App() {
  return (
    <div style={{maxWidth:'400px',margin:'40px auto',fontFamily:'system-ui'}}>
      <h2>My To-Do List</h2>
      <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
        <input placeholder="Add item..." style={{flex:1,padding:'8px',borderRadius:'6px',border:'1px solid #ccc'}} />
        <button style={{padding:'8px 16px'}}>Add</button>
      </div>
      <ul style={{listStyle:'none',padding:0}}>
        <li style={{display:'flex',justifyContent:'space-between',padding:'8px',marginBottom:'4px',background:'#f1f5f9',borderRadius:'6px'}}>
          Example item <button>×</button>
        </li>
      </ul>
    </div>
  );
}`,
  },
  {
    slug: 'useeffect-timer',
    title: 'useEffect Timer Challenge',
    description: 'Build a live stopwatch using useEffect and setInterval.',
    type: 'challenge',
    duration: '20 min',
    module: 'module-2-hooks',
    goal: 'Build a stopwatch with Start, Stop, and Reset buttons. The timer should count up in seconds using useEffect. Clicking Stop should pause it (not reset). Clicking Start again should resume from where it stopped.',
    starterCode: `// Build a stopwatch!
// Requirements:
// - Shows elapsed seconds: "0s", "1s", "2s" ...
// - Start button begins counting
// - Stop button pauses (does NOT reset)
// - Reset button sets back to 0
// - useEffect + setInterval (clear on cleanup!)

function App() {
  return (
    <div style={{textAlign:'center',marginTop:'60px',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'3rem',fontVariantNumeric:'tabular-nums'}}>0s</h1>
      <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
        <button>Start</button>
        <button>Stop</button>
        <button>Reset</button>
      </div>
    </div>
  );
}`,
  },
];

export function getLab(slug: string): LabDefinition | undefined {
  return LABS.find((l) => l.slug === slug);
}
