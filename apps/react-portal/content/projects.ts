export interface ProjectStep {
  title: string;
  instruction: string;
  starterCode: string;
  hint: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate';
  steps: ProjectStep[];
}

export const REACT_PROJECTS: Project[] = [
  {
    slug: 'task-manager',
    title: 'Task Manager App',
    description: 'Build a full task manager with add, complete, and delete — step by step.',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Step 1 — Render a static task list',
        instruction: 'Create an App component that renders a hardcoded list of 3 tasks. Each task is a string in an array. Map over the array and render each task in a <li>.',
        hint: 'Use tasks.map((task, i) => <li key={i}>{task}</li>) inside a <ul>.',
        starterCode: `function App() {
  const tasks = ['Buy groceries', 'Walk the dog', 'Read a book'];

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <ul>
        {/* map over tasks here */}
      </ul>
    </div>
  );
}`,
      },
      {
        title: 'Step 2 — Add a task with useState',
        instruction: 'Replace the hardcoded array with useState. Add an <input> and a button. When the button is clicked, push the input value into the tasks array (as a new state — never mutate). Clear the input after adding.',
        hint: 'Use setTasks(prev => [...prev, newTask]) to avoid mutation. Use a separate useState for the input value.',
        starterCode: `function App() {
  const [tasks, setTasks] = React.useState(['Buy groceries', 'Walk the dog', 'Read a book']);
  const [input, setInput] = React.useState('');

  const addTask = () => {
    // 1. push input to tasks (immutably)
    // 2. clear input
  };

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="New task..." style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}} />
        <button onClick={addTask} style={{padding:'8px 16px', borderRadius:'6px', background:'#6366f1', color:'white', border:'none', cursor:'pointer'}}>Add</button>
      </div>
      <ul>
        {tasks.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}`,
      },
      {
        title: 'Step 3 — Mark tasks complete',
        instruction: 'Change tasks from strings to objects: { text: string, done: boolean }. Add a checkbox to each task. When the checkbox changes, toggle the done property (immutably — use map). Style done tasks with a line-through.',
        hint: 'setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t)) toggles one task without mutating.',
        starterCode: `function App() {
  const [tasks, setTasks] = React.useState([
    { text: 'Buy groceries', done: false },
    { text: 'Walk the dog', done: false },
    { text: 'Read a book', done: false },
  ]);
  const [input, setInput] = React.useState('');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks(prev => [...prev, { text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleTask = (idx) => {
    // toggle tasks[idx].done immutably
  };

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="New task..." style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}} />
        <button onClick={addTask} style={{padding:'8px 16px', borderRadius:'6px', background:'#6366f1', color:'white', border:'none', cursor:'pointer'}}>Add</button>
      </div>
      <ul style={{listStyle:'none', padding:0}}>
        {tasks.map((t, i) => (
          <li key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #f1f5f9'}}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(i)} />
            <span style={{textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : 'inherit'}}>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
      {
        title: 'Step 4 — Delete tasks',
        instruction: 'Add a Delete button next to each task. When clicked, remove that task from the array using filter.',
        hint: 'setTasks(tasks.filter((_, i) => i !== idx)) removes the task at index idx.',
        starterCode: `function App() {
  const [tasks, setTasks] = React.useState([
    { text: 'Buy groceries', done: false },
    { text: 'Walk the dog', done: false },
    { text: 'Read a book', done: false },
  ]);
  const [input, setInput] = React.useState('');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks(prev => [...prev, { text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleTask = (idx) => {
    setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (idx) => {
    // remove tasks[idx] immutably
  };

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="New task..." style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}} />
        <button onClick={addTask} style={{padding:'8px 16px', borderRadius:'6px', background:'#6366f1', color:'white', border:'none', cursor:'pointer'}}>Add</button>
      </div>
      <ul style={{listStyle:'none', padding:0}}>
        {tasks.map((t, i) => (
          <li key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #f1f5f9'}}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(i)} />
            <span style={{flex:1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : 'inherit'}}>{t.text}</span>
            <button onClick={() => deleteTask(i)} style={{padding:'4px 8px', borderRadius:'4px', background:'#fee2e2', color:'#dc2626', border:'none', cursor:'pointer', fontSize:'12px'}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
      {
        title: 'Step 5 — Persist to localStorage',
        instruction: 'Use useEffect to save tasks to localStorage whenever they change. On mount, read the stored tasks and use them as the initial state (with a fallback to the default list). Now your tasks survive page refresh.',
        hint: 'Pass a function to useState as the initial value: useState(() => { const raw = localStorage.getItem("tasks"); return raw ? JSON.parse(raw) : defaultTasks; }). Use useEffect(() => { localStorage.setItem("tasks", JSON.stringify(tasks)); }, [tasks]) to sync.',
        starterCode: `const DEFAULT_TASKS = [
  { text: 'Buy groceries', done: false },
  { text: 'Walk the dog', done: false },
  { text: 'Read a book', done: false },
];

function App() {
  const [tasks, setTasks] = React.useState(() => {
    // read from localStorage here, fallback to DEFAULT_TASKS
    return DEFAULT_TASKS;
  });
  const [input, setInput] = React.useState('');

  React.useEffect(() => {
    // save tasks to localStorage here
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks(prev => [...prev, { text: input.trim(), done: false }]);
    setInput('');
  };
  const toggleTask = (idx) => setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  const deleteTask = (idx) => setTasks(tasks.filter((_, i) => i !== idx));

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <p style={{color:'#64748b', fontSize:'14px'}}>
        {tasks.filter(t => t.done).length}/{tasks.length} done
      </p>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="New task..." style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}} />
        <button onClick={addTask} style={{padding:'8px 16px', borderRadius:'6px', background:'#6366f1', color:'white', border:'none', cursor:'pointer'}}>Add</button>
      </div>
      <ul style={{listStyle:'none', padding:0}}>
        {tasks.map((t, i) => (
          <li key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #f1f5f9'}}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(i)} />
            <span style={{flex:1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : 'inherit'}}>{t.text}</span>
            <button onClick={() => deleteTask(i)} style={{padding:'4px 8px', borderRadius:'4px', background:'#fee2e2', color:'#dc2626', border:'none', cursor:'pointer', fontSize:'12px'}}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    ],
  },
];
