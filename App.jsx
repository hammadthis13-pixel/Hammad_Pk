import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Unlock, PlayCircle, CheckSquare, 
  Users, CreditCard, Home, Settings, LogOut, 
  DollarSign, Activity, Shield, Menu, X, CheckCircle,
  TrendingUp, Gift, ChevronRight, Youtube, Globe,
  AlertCircle, Copy, ChevronDown, ChevronUp, Trash2, Plus, 
  ArrowUpRight, ArrowDownLeft, History, ArrowLeft, Info, FileText, Key, Edit2, Save, Video, Link as LinkIcon, UserPlus, Upload, Eye, Image as ImageIcon
} from 'lucide-react';

// --- INITIAL DATA (Database) ---

const INITIAL_DB = {
  users: [],
  deposits: [],
  withdrawals: [],
  taskSubmissions: [], 
  plans: [
    { id: 1, name: 'Basic', price: 0, dailyLimit: 5 },
    { id: 2, name: 'VIP 1', price: 1000, dailyLimit: 15 },
    { id: 3, name: 'VIP 2', price: 5000, dailyLimit: 30 },
  ],
  tasks: [
    { id: 1, title: 'Watch Video Ad', reward: 25, type: 'video', duration: 10, link: '' },
    { id: 2, title: 'Subscribe Channel', reward: 50, type: 'youtube', link: 'https://youtube.com' },
  ],
  settings: {
    siteName: 'Hammad.pk',
    notice: 'Welcome to Hammad.pk! Official Earning Platform.',
    minDeposit: 500,
    maxDeposit: 50000,
    minWithdraw: 1000,
    maxWithdraw: 25000
  }
};

// --- THEME ---
const THEME = {
  bg: "bg-black",
  card: "bg-neutral-900",
  text: "text-amber-500",
  textSec: "text-neutral-400",
};

// --- BUTTON COMPONENT ---
const Button = ({ children, onClick, variant = 'primary', className = '', full = false, disabled = false }) => {
  const styles = {
    primary: "bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-neutral-800 text-amber-500 border border-amber-900/50 hover:bg-neutral-700 disabled:opacity-50",
    danger: "bg-red-900/20 text-red-500 border border-red-900",
    success: "bg-emerald-900/20 text-emerald-500 border border-emerald-900"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`py-3 px-6 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${styles[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [db, setDb] = useState(INITIAL_DB);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('auth'); 
  const [loading, setLoading] = useState(true);

  // Load Data on Startup
  useEffect(() => {
    const saved = localStorage.getItem('hammadPk_db_v8'); 
    if (saved) setDb(JSON.parse(saved));
    setLoading(false);
  }, []);

  // Save Data Automatically
  useEffect(() => {
    if (!loading) localStorage.setItem('hammadPk_db_v8', JSON.stringify(db));
  }, [db, loading]);

  // Auth Functions
  const register = (data) => {
    if (db.users.some(u => u.email === data.email)) return alert("Email already exists!");
    const newUser = {
      id: Date.now(),
      ...data,
      balance: 0,
      planId: 1,
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(), 
      referredBy: data.refCode || null,
      stats: { tasks: 0 },
      joined: new Date().toISOString(),
      isBanned: false
    };

    setDb(prev => ({ ...prev, users: [...prev.users, newUser] }));
    setCurrentUser(newUser);
    setView('user');
  };

  const login = (email, pass) => {
    const user = db.users.find(u => u.email === email && u.password === pass);
    if (!user) return alert("Invalid credentials");
    if (user.isBanned) return alert("Account Banned!");
    setCurrentUser(user);
    setView('user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setDb(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === currentUser.id ? updatedUser : u)
    }));
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-amber-500">Loading Hammad.pk...</div>;

  return (
    <div className="min-h-screen bg-black text-amber-500 font-sans selection:bg-amber-500 selection:text-black">
      {view === 'auth' && <AuthScreen onLogin={login} onRegister={register} toAdmin={() => setView('adminAuth')} />}
      {view === 'adminAuth' && <AdminLogin onLogin={() => setView('admin')} onBack={() => setView('auth')} />}
      {view === 'user' && currentUser && (
        <UserApp 
          user={currentUser} 
          db={db} 
          updateUser={updateUser} 
          setDb={setDb} 
          logout={() => { setCurrentUser(null); setView('auth'); }} 
        />
      )}
      {view === 'admin' && <AdminPanel db={db} setDb={setDb} logout={() => setView('auth')} />}
    </div>
  );
}

// --- USER PANEL ---

function UserApp({ user, db, updateUser, setDb, logout }) {
  const [tab, setTab] = useState('home');
  
  const renderTab = () => {
    switch(tab) {
      case 'home': return <HomeTab user={user} db={db} setTab={setTab} />;
      case 'tasks': return <TaskCenter user={user} db={db} setDb={setDb} />;
      case 'wallet': return <WalletTab user={user} db={db} setDb={setDb} updateUser={updateUser} />;
      case 'team': return <TeamTab user={user} db={db} />;
      case 'profile': return <ProfileTab user={user} logout={logout} updateUser={updateUser} />;
      default: return <HomeTab />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-black min-h-screen relative border-x border-neutral-800">
      <div className="p-4 flex justify-between items-center bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <h1 className="font-bold text-xl text-amber-500">Hammad.pk</h1>
        <div className="text-xs text-neutral-400">User: {user.name}</div>
      </div>

      <div className="pb-24">{renderTab()}</div>
      
      <div className="fixed bottom-0 max-w-md w-full bg-neutral-900 border-t border-neutral-800 p-2 flex justify-around items-center z-50">
        <NavBtn icon={Home} label="Home" active={tab === 'home'} onClick={() => setTab('home')} />
        <NavBtn icon={PlayCircle} label="Earn" active={tab === 'tasks'} onClick={() => setTab('tasks')} />
        <div className="relative -top-6">
           <button onClick={() => setTab('wallet')} className="bg-gradient-to-t from-amber-600 to-yellow-500 p-4 rounded-full shadow-lg border-4 border-black text-black">
             <DollarSign size={28} />
           </button>
        </div>
        <NavBtn icon={Users} label="Team" active={tab === 'team'} onClick={() => setTab('team')} />
        <NavBtn icon={User} label="Profile" active={tab === 'profile'} onClick={() => setTab('profile')} />
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function HomeTab({ user, db, setTab }) {
  return (
    <div className="p-5 space-y-6">
      <div className="bg-gradient-to-br from-neutral-900 to-black p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
        <p className="text-neutral-400 text-xs uppercase tracking-widest">Available Balance</p>
        <h1 className="text-4xl font-bold mt-2 text-white">₨ {user.balance.toFixed(2)}</h1>
        <div className="mt-4 flex gap-3">
           <Button className="flex-1 text-sm h-10" onClick={()=>setTab('wallet')}>Wallet</Button>
           <Button className="flex-1 text-sm h-10" variant="secondary" onClick={()=>setTab('tasks')}>Earn Now</Button>
        </div>
      </div>

      <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 flex gap-3 items-center">
         <AlertCircle className="text-amber-500 shrink-0" size={20} />
         <p className="text-xs text-neutral-300">{db.settings.notice}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
           <CheckCircle className="text-emerald-500 mb-2" />
           <h3 className="text-2xl font-bold text-white">{user.stats.tasks}</h3>
           <p className="text-xs text-neutral-400">Tasks Completed</p>
        </div>
        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
           <TrendingUp className="text-blue-500 mb-2" />
           <h3 className="text-2xl font-bold text-white">VIP 1</h3>
           <p className="text-xs text-neutral-400">Current Plan</p>
        </div>
      </div>
    </div>
  );
}

function TaskCenter({ user, db, setDb }) {
  const [view, setView] = useState('menu');
  const [activeTask, setActiveTask] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [watching, setWatching] = useState(null);
  const [timer, setTimer] = useState(0);

  const startVideoTask = (task) => {
    setWatching(task);
    setTimer(task.duration || 10);
  };

  useEffect(() => {
    let interval;
    if (watching && timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
    else if (watching && timer === 0) {
      const updatedUsers = db.users.map(u => u.id === user.id ? { ...u, balance: u.balance + watching.reward, stats: { ...u.stats, tasks: u.stats.tasks + 1 } } : u);
      setDb({ ...db, users: updatedUsers });
      alert("Ad Watched! Reward Added.");
      setWatching(null);
    }
    return () => clearInterval(interval);
  }, [watching, timer]);

  const openTaskLink = (task) => {
    window.open(task.link, '_blank');
    setActiveTask(task.id);
  };

  const submitProof = (task) => {
    if (!proofFile) return alert("Please select a screenshot first!");
    
    const newSubmission = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      taskId: task.id,
      taskTitle: task.title,
      reward: task.reward,
      status: 'pending',
      date: new Date().toLocaleDateString(),
      proofName: proofFile.name 
    };

    setDb(prev => ({ ...prev, taskSubmissions: [newSubmission, ...(prev.taskSubmissions || [])] }));
    setActiveTask(null);
    setProofFile(null);
    alert("Proof Submitted! Admin will verify.");
  };

  if (watching) return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
       <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
       <h2 className="text-white text-xl font-bold">Watching Ad...</h2>
       <p className="text-amber-500 mt-2">{timer} seconds remaining</p>
    </div>
  );

  if (view === 'menu') {
    return (
      <div className="p-5 space-y-6">
        <h2 className="text-xl font-bold text-white">Earn Money</h2>
        <button onClick={() => setView('ads')} className="w-full bg-neutral-900 p-6 rounded-2xl border border-neutral-800 hover:border-red-500 transition group text-left flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="bg-red-900/20 w-14 h-14 rounded-full flex items-center justify-center text-red-500 group-hover:scale-110 transition"><Video size={28} /></div>
              <div><h3 className="text-lg font-bold text-white">Watch Ads</h3><p className="text-xs text-neutral-500">Auto Reward</p></div>
           </div>
           <ChevronRight className="text-neutral-600" />
        </button>
        <button onClick={() => setView('tasks')} className="w-full bg-neutral-900 p-6 rounded-2xl border border-neutral-800 hover:border-blue-500 transition group text-left flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="bg-blue-900/20 w-14 h-14 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition"><LinkIcon size={28} /></div>
              <div><h3 className="text-lg font-bold text-white">Complete Tasks</h3><p className="text-xs text-neutral-500">Subscribe & Screenshot</p></div>
           </div>
           <ChevronRight className="text-neutral-600" />
        </button>
      </div>
    );
  }

  const filteredTasks = db.tasks.filter(t => view === 'ads' ? t.type === 'video' : t.type !== 'video');

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <button onClick={() => setView('menu')} className="flex items-center gap-2 text-neutral-400 mb-4 hover:text-white"><ArrowLeft size={16} /> Back</button>
      <h2 className="text-xl font-bold text-white">{view === 'ads' ? 'Watch Ads' : 'Task List'}</h2>
      {filteredTasks.length === 0 ? <p className="text-neutral-500">No tasks available.</p> : 
       filteredTasks.map(t => (
        <div key={t.id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-3 hover:border-amber-500/50 transition">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="bg-amber-900/20 p-2 rounded-lg text-amber-500">{t.type === 'video' ? <PlayCircle /> : <Globe />}</div>
               <div><h3 className="text-white font-bold">{t.title}</h3><p className="text-emerald-500 text-xs font-bold">+{t.reward} PKR</p></div>
             </div>
             {t.type === 'video' ? (
                <Button className="px-4 py-2 text-xs" onClick={() => startVideoTask(t)}>Watch</Button>
             ) : (
                activeTask === t.id ? <span className="text-xs text-amber-500 animate-pulse">Uploading...</span> : <Button className="px-4 py-2 text-xs" onClick={() => openTaskLink(t)}>Start</Button>
             )}
           </div>
           {activeTask === t.id && t.type !== 'video' && (
             <div className="bg-black p-3 rounded border border-neutral-800 animate-fade-in">
                <p className="text-xs text-neutral-400 mb-2">1. Subscribe<br/> 2. Take Screenshot <br/> 3. Upload</p>
                <div className="flex gap-2">
                   <label className="flex-1 bg-neutral-800 text-neutral-300 text-xs flex items-center justify-center p-2 rounded cursor-pointer hover:bg-neutral-700">
                      <Upload size={14} className="mr-2"/> {proofFile ? 'Selected' : 'Select Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setProofFile(e.target.files[0])} />
                   </label>
                   <button onClick={() => submitProof(t)} className="bg-emerald-600 text-white text-xs px-4 rounded font-bold hover:bg-emerald-500">Submit</button>
                </div>
                {proofFile && <p className="text-[10px] text-amber-500 mt-1 truncate">{proofFile.name}</p>}
             </div>
           )}
        </div>
      ))}
    </div>
  );
}

function WalletTab({ user, db, setDb, updateUser }) {
  const [mode, setMode] = useState('menu'); 
  const [amount, setAmount] = useState('');
  const [meta, setMeta] = useState('');

  const submitDeposit = () => {
    if(!amount || !meta) return alert("Fill all fields");
    const val = Number(amount);
    if(val < db.settings.minDeposit) return alert(`Minimum deposit is ${db.settings.minDeposit} PKR`);
    if(val > db.settings.maxDeposit) return alert(`Maximum deposit is ${db.settings.maxDeposit} PKR`);
    const req = { id: Date.now(), userId: user.id, userName: user.name, amount: val, trxId: meta, status: 'pending', date: new Date().toLocaleDateString() };
    setDb(prev => ({ ...prev, deposits: [req, ...prev.deposits] }));
    setAmount(''); setMeta('');
    alert("Deposit Submitted!");
    setMode('menu');
  };

  const submitWithdraw = () => {
    if(!amount || !meta) return alert("Fill all fields");
    const val = Number(amount);
    if(val < db.settings.minWithdraw) return alert(`Min withdraw: ${db.settings.minWithdraw} PKR`);
    if(val > db.settings.maxWithdraw) return alert(`Max withdraw: ${db.settings.maxWithdraw} PKR`);
    if(val > user.balance) return alert("Insufficient Balance");
    const req = { id: Date.now(), userId: user.id, userName: user.name, amount: val, account: meta, status: 'pending', date: new Date().toLocaleDateString() };
    setDb(prev => ({ ...prev, withdrawals: [req, ...prev.withdrawals] }));
    updateUser({ balance: user.balance - val });
    setAmount(''); setMeta('');
    alert("Withdrawal Requested!");
    setMode('menu');
  };

  if(mode === 'deposit') return (
    <div className="p-5 animate-fade-in">
      <button onClick={()=>setMode('menu')} className="flex items-center gap-2 text-neutral-400 mb-6"><ArrowLeft size={16}/> Back</button>
      <h2 className="text-2xl font-bold text-white mb-6">Deposit</h2>
      <div className="space-y-4">
         <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-400">
             Min: <span className="text-amber-500">{db.settings.minDeposit}</span> | Max: <span className="text-amber-500">{db.settings.maxDeposit}</span>
         </div>
         <select className="w-full bg-black border border-neutral-800 rounded p-3 text-white"><option>EasyPaisa</option><option>JazzCash</option></select>
         <input type="number" placeholder="Amount (PKR)" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white outline-none focus:border-amber-500" value={amount} onChange={e=>setAmount(e.target.value)} />
         <input type="text" placeholder="TRX ID" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white outline-none focus:border-amber-500" value={meta} onChange={e=>setMeta(e.target.value)} />
         <Button full onClick={submitDeposit} variant="success">Verify</Button>
      </div>
    </div>
  );

  if(mode === 'withdraw') return (
    <div className="p-5 animate-fade-in">
      <button onClick={()=>setMode('menu')} className="flex items-center gap-2 text-neutral-400 mb-6"><ArrowLeft size={16}/> Back</button>
      <h2 className="text-2xl font-bold text-white mb-6">Withdraw</h2>
      <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 mb-6 flex justify-between items-center">
         <span className="text-neutral-400">Balance</span><span className="text-xl font-bold text-amber-500">₨ {user.balance}</span>
      </div>
      <div className="space-y-4">
         <input type="number" placeholder="Amount" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white outline-none focus:border-amber-500" value={amount} onChange={e=>setAmount(e.target.value)} />
         <input type="text" placeholder="Account Number" className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white outline-none focus:border-amber-500" value={meta} onChange={e=>setMeta(e.target.value)} />
         <Button full onClick={submitWithdraw} variant="danger">Request</Button>
      </div>
    </div>
  );

  return (
    <div className="p-5 space-y-4">
       <div className="grid grid-cols-2 gap-4">
          <button onClick={()=>setMode('deposit')} className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 hover:border-emerald-500 text-left group transition">
             <div className="bg-emerald-900/20 w-12 h-12 rounded-full flex items-center justify-center text-emerald-500 mb-3 group-hover:scale-110 transition"><ArrowDownLeft /></div>
             <h3 className="font-bold text-white">Deposit</h3>
          </button>
          <button onClick={()=>setMode('withdraw')} className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 hover:border-red-500 text-left group transition">
             <div className="bg-red-900/20 w-12 h-12 rounded-full flex items-center justify-center text-red-500 mb-3 group-hover:scale-110 transition"><ArrowUpRight /></div>
             <h3 className="font-bold text-white">Withdraw</h3>
          </button>
       </div>
       <div className="mt-8">
         <h3 className="text-white font-bold mb-4">History</h3>
         {[...db.deposits, ...db.withdrawals].filter(x => x.userId === user.id).sort((a,b) => b.id - a.id).map(x => (
           <div key={x.id} className="flex justify-between items-center bg-neutral-900 p-3 rounded-lg border border-neutral-800 mb-2">
             <div><p className="text-white font-bold">{x.trxId ? 'Deposit' : 'Withdraw'}</p><p className="text-xs text-neutral-500">{x.date}</p></div>
             <div className="text-right"><p className={`font-bold ${x.trxId ? 'text-emerald-500' : 'text-red-500'}`}>{x.trxId ? '+' : '-'} {x.amount}</p><span className="text-[10px] text-neutral-400 capitalize">{x.status}</span></div>
           </div>
         ))}
       </div>
    </div>
  );
}

function TeamTab({ user, db }) {
  const team = db.users.filter(u => u.referredBy === user.referralCode);
  const referralLink = `${window.location.origin}?ref=${user.referralCode}`;

  return (
    <div className="p-5 space-y-6 animate-fade-in">
      <div className="bg-neutral-900 p-6 rounded-2xl text-center border border-amber-500/30">
         <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-4"><UserPlus size={32} /></div>
         <h2 className="text-2xl font-bold text-white mb-2">Invite & Earn</h2>
         <p className="text-neutral-400 text-sm mb-6">Share your link and earn rewards.</p>
         <div className="bg-black p-4 rounded-xl border border-neutral-800 flex flex-col gap-3">
            <p className="text-xs text-neutral-500 text-left">Your Referral Link</p>
            <div className="bg-neutral-900 p-3 rounded border border-neutral-800 text-xs text-amber-500 break-all font-mono">{referralLink}</div>
            <Button onClick={() => {navigator.clipboard.writeText(referralLink); alert("Link Copied!")}} variant="primary" full><Copy size={16} /> Copy Link</Button>
         </div>
      </div>
      <div>
        <h3 className="font-bold text-white mb-4 flex items-center justify-between"><span>My Team</span><span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400">{team.length} Members</span></h3>
        {team.length === 0 ? <div className="text-center py-10 border border-dashed border-neutral-800 rounded-xl text-neutral-500">No team members yet.</div> : 
           team.map(m => (
             <div key={m.id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-amber-500 font-bold">{m.name[0]}</div>
                <div><h4 className="font-bold text-white">{m.name}</h4><p className="text-xs text-neutral-500">Joined: {new Date(m.joined).toLocaleDateString()}</p></div>
             </div>
           ))
        }
      </div>
    </div>
  );
}

function ProfileTab({ user, logout, updateUser }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [newPass, setNewPass] = useState('');

  const handlePassChange = () => {
    if(newPass.length < 4) return alert("Password too short");
    updateUser({ password: newPass });
    setChangingPass(false);
    setNewPass('');
    alert("Password Changed Successfully!");
  };

  if(showPrivacy) return <div className="p-5"><button onClick={()=>setShowPrivacy(false)} className="mb-4 text-neutral-400">Back</button><h2 className="text-2xl text-white font-bold mb-4">Privacy Policy</h2><p className="text-neutral-400">Your data is stored locally.</p></div>;
  if(showAbout) return <div className="p-5"><button onClick={()=>setShowAbout(false)} className="mb-4 text-neutral-400">Back</button><h2 className="text-2xl text-white font-bold mb-4">About Us</h2><p className="text-neutral-400">Hammad.pk is the leading earning platform.</p></div>;

  return (
    <div className="p-5 space-y-1">
       <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 mb-6 text-center">
          <div className="w-20 h-20 bg-amber-500 text-black font-bold text-3xl rounded-full flex items-center justify-center mx-auto mb-3">{user.name[0]}</div>
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-neutral-500 text-sm">{user.email}</p>
       </div>
       <ProfileBtn icon={FileText} label="Privacy Policy" onClick={()=>setShowPrivacy(true)} />
       <ProfileBtn icon={Info} label="About Us" onClick={()=>setShowAbout(true)} />
       <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex flex-col gap-2 mt-4">
          <button onClick={()=>setChangingPass(!changingPass)} className="flex items-center gap-3 text-white"><Key size={20} className="text-amber-500" /> Change Password</button>
          {changingPass && (<div className="flex gap-2 mt-2"><input placeholder="New Password" className="bg-black border border-neutral-800 p-2 rounded text-white w-full" value={newPass} onChange={e=>setNewPass(e.target.value)} /><Button onClick={handlePassChange}>Save</Button></div>)}
       </div>
       <div className="pt-6"><Button variant="danger" full onClick={logout}>Log Out</Button></div>
    </div>
  );
}

const ProfileBtn = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="w-full bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex items-center justify-between hover:bg-neutral-800 transition mb-2">
    <div className="flex items-center gap-3"><Icon size={20} className="text-amber-500" /><span className="text-white">{label}</span></div>
    <ChevronRight size={16} className="text-neutral-500" />
  </button>
);

function AdminPanel({ db, setDb, logout }) {
  const [tab, setTab] = useState('dash');
  const [newTask, setNewTask] = useState({ title: '', reward: 10, type: 'web', link: '' });
  const [editingUser, setEditingUser] = useState(null); 
  const [editForm, setEditForm] = useState({ balance: 0, password: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [editingTx, setEditingTx] = useState(null);
  const [txForm, setTxForm] = useState({ amount: 0, trxId: '' });
  const [settingsForm, setSettingsForm] = useState(db.settings);

  const processSubmission = (id, approved) => {
    const sub = db.taskSubmissions.find(s => s.id === id);
    if (!sub) return;
    const newSubs = db.taskSubmissions.map(s => s.id === id ? { ...s, status: approved ? 'approved' : 'rejected' } : s);
    let newUsers = [...db.users];
    if (approved) {
       newUsers = newUsers.map(u => u.id === sub.userId ? { ...u, balance: u.balance + sub.reward, stats: { ...u.stats, tasks: u.stats.tasks + 1 } } : u);
    }
    setDb({ ...db, taskSubmissions: newSubs, users: newUsers });
  };

  const addTask = () => {
    if(!newTask.title) return;
    const task = { id: Date.now(), ...newTask, duration: 10 };
    setDb({ ...db, tasks: [task, ...db.tasks] });
    setNewTask({ title: '', reward: 10, type: 'web', link: '' });
    alert("Task Added");
  };
  const deleteTask = (id) => setDb({ ...db, tasks: db.tasks.filter(t => t.id !== id) });

  const handleEditUser = (u) => { setEditingUser(u.id); setEditForm({ balance: u.balance, password: u.password }); };
  const saveUserEdit = () => {
    setDb({ ...db, users: db.users.map(u => u.id === editingUser ? { ...u, balance: Number(editForm.balance), password: editForm.password } : u) });
    setEditingUser(null);
    alert("User Updated!");
  };

  const processTx = (id, type, status) => {
    const list = type === 'dep' ? db.deposits : db.withdrawals;
    const item = list.find(i => i.id === id);
    const newList = list.map(i => i.id === id ? { ...i, status } : i);
    let newUsers = [...db.users];
    if(status === 'approved') { if(type === 'dep') newUsers = newUsers.map(u => u.id === item.userId ? { ...u, balance: u.balance + item.amount } : u); }
    else if (status === 'rejected' && type === 'with') { newUsers = newUsers.map(u => u.id === item.userId ? { ...u, balance: u.balance + item.amount } : u); }
    setDb({ ...db, deposits: type === 'dep' ? newList : db.deposits, withdrawals: type === 'with' ? newList : db.withdrawals, users: newUsers });
  };

  const saveSettings = () => { setDb({ ...db, settings: settingsForm }); alert("Settings Saved!"); };

  return (
    <div className="flex h-screen bg-black text-white flex-col md:flex-row">
      <div className={`transition-all duration-300 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col ${isMenuOpen ? 'md:w-64 h-auto' : 'md:w-20 h-auto md:h-full'}`}>
         <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center justify-between cursor-pointer mb-8 hover:bg-neutral-800 p-2 rounded transition">
            <div className="flex items-center gap-2"><Shield className="text-amber-500 shrink-0" size={24} /><h2 className={`text-xl font-bold text-amber-500 whitespace-nowrap ${!isMenuOpen && 'md:hidden'}`}>Admin</h2></div>
            {isMenuOpen ? <ChevronUp className="md:hidden" /> : <ChevronDown className="md:hidden" />}
         </div>
         <nav className={`space-y-2 flex-1 ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
            <AdminBtn icon={Activity} label="Dashboard" active={tab==='dash'} onClick={()=>setTab('dash')} collapsed={!isMenuOpen} />
            <AdminBtn icon={ImageIcon} label="Approvals" active={tab==='approvals'} onClick={()=>setTab('approvals')} collapsed={!isMenuOpen} count={(db.taskSubmissions || []).filter(s => s.status === 'pending').length} />
            <AdminBtn icon={CheckSquare} label="Tasks" active={tab==='tasks'} onClick={()=>setTab('tasks')} collapsed={!isMenuOpen} />
            <AdminBtn icon={Users} label="Users" active={tab==='users'} onClick={()=>setTab('users')} collapsed={!isMenuOpen} />
            <AdminBtn icon={DollarSign} label="Finance" active={tab==='fin'} onClick={()=>setTab('fin')} collapsed={!isMenuOpen} />
            <AdminBtn icon={Settings} label="Settings" active={tab==='set'} onClick={()=>setTab('set')} collapsed={!isMenuOpen} />
         </nav>
         <button onClick={logout} className={`mt-auto text-red-500 p-2 hover:bg-neutral-800 rounded flex items-center gap-2 ${!isMenuOpen && 'md:justify-center'}`}><LogOut size={20} /> <span className={!isMenuOpen ? 'md:hidden' : ''}>Logout</span></button>
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-auto">
         {tab === 'dash' && <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-neutral-900 p-6 rounded border border-neutral-800"><h3 className="text-neutral-400">Total Users</h3><p className="text-4xl font-bold text-white">{db.users.length}</p></div><div className="bg-neutral-900 p-6 rounded border border-neutral-800"><h3 className="text-neutral-400">Pending Proofs</h3><p className="text-4xl font-bold text-amber-500">{(db.taskSubmissions || []).filter(s => s.status === 'pending').length}</p></div></div>}
         {tab === 'approvals' && <div><h2 className="text-2xl font-bold mb-6 text-amber-500">Task Proofs</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{(db.taskSubmissions || []).sort((a,b)=>b.id-a.id).map(sub => (<div key={sub.id} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col gap-3"><div className="flex justify-between items-start"><div><p className="text-white font-bold">{sub.taskTitle}</p><p className="text-xs text-neutral-400">User: {sub.userName}</p></div><span className="text-xs px-2 py-1 rounded capitalize bg-yellow-900/30 text-yellow-500">{sub.status}</span></div><div className="bg-black p-3 rounded flex items-center gap-3"><ImageIcon size={20}/><p className="text-xs text-amber-500 flex-1 truncate">{sub.proofName}</p></div>{sub.status === 'pending' && (<div className="flex gap-2"><Button onClick={()=>processSubmission(sub.id, true)} variant="success" className="flex-1 py-1 text-xs">Approve</Button><Button onClick={()=>processSubmission(sub.id, false)} variant="danger" className="flex-1 py-1 text-xs">Reject</Button></div>)}</div>))}</div></div>}
         {tab === 'set' && <div><h2 className="text-2xl font-bold mb-6 text-amber-500">Settings</h2><div className="bg-neutral-900 p-6 rounded border border-neutral-800 max-w-lg space-y-4"><div><label className="text-xs text-neutral-400">Min Deposit</label><input type="number" className="w-full bg-black border border-neutral-700 p-2 rounded text-white" value={settingsForm.minDeposit} onChange={e=>setSettingsForm({...settingsForm, minDeposit: Number(e.target.value)})} /></div><div><label className="text-xs text-neutral-400">Max Deposit</label><input type="number" className="w-full bg-black border border-neutral-700 p-2 rounded text-white" value={settingsForm.maxDeposit} onChange={e=>setSettingsForm({...settingsForm, maxDeposit: Number(e.target.value)})} /></div><div className="pt-2 border-t border-neutral-800"><label className="text-xs text-neutral-400">Min Withdraw</label><input type="number" className="w-full bg-black border border-neutral-700 p-2 rounded text-white" value={settingsForm.minWithdraw} onChange={e=>setSettingsForm({...settingsForm, minWithdraw: Number(e.target.value)})} /></div><div><label className="text-xs text-neutral-400">Max Withdraw</label><input type="number" className="w-full bg-black border border-neutral-700 p-2 rounded text-white" value={settingsForm.maxWithdraw} onChange={e=>setSettingsForm({...settingsForm, maxWithdraw: Number(e.target.value)})} /></div><Button onClick={saveSettings}>Save Settings</Button></div></div>}
         {tab === 'tasks' && <div><div className="bg-neutral-900 p-4 rounded mb-6 border border-neutral-800"><h3 className="font-bold mb-4">Add Task</h3><div className="grid grid-cols-2 gap-4 mb-4"><input placeholder="Title" className="bg-black border border-neutral-800 p-2 rounded text-white" value={newTask.title} onChange={e=>setNewTask({...newTask, title: e.target.value})} /><input placeholder="Reward" type="number" className="bg-black border border-neutral-800 p-2 rounded text-white" value={newTask.reward} onChange={e=>setNewTask({...newTask, reward: Number(e.target.value)})} /><select className="bg-black border border-neutral-800 p-2 rounded text-white" value={newTask.type} onChange={e=>setNewTask({...newTask, type: e.target.value})}><option value="web">Link</option><option value="video">Video</option><option value="youtube">YouTube</option></select><input placeholder="Link URL" className="bg-black border border-neutral-800 p-2 rounded text-white" value={newTask.link} onChange={e=>setNewTask({...newTask, link: e.target.value})} /></div><Button onClick={addTask}>Add Task</Button></div>{db.tasks.map(t => (<div key={t.id} className="flex justify-between items-center bg-neutral-900 p-4 rounded mb-2 border border-neutral-800"><span>{t.title} ({t.reward} PKR) - {t.type}</span><button onClick={()=>deleteTask(t.id)} className="text-red-500"><Trash2 size={16}/></button></div>))}</div>}
         {tab === 'users' && <div><h3 className="text-2xl font-bold mb-4">Users</h3><div className="overflow-x-auto bg-neutral-900 rounded border border-neutral-800"><table className="w-full text-left min-w-[600px]"><thead className="bg-neutral-800 text-neutral-400"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Pass</th><th className="p-3">Balance</th><th className="p-3">Action</th></tr></thead><tbody>{db.users.map(u => (<tr key={u.id} className="border-b border-neutral-800"><td className="p-3">{u.name}</td><td className="p-3 text-sm text-neutral-500">{u.email}</td><td className="p-3 text-sm">{editingUser === u.id ? <input className="bg-black p-1 w-20 text-white border border-neutral-700" value={editForm.password} onChange={e=>setEditForm({...editForm, password: e.target.value})} /> : u.password}</td><td className="p-3 text-amber-500">{editingUser === u.id ? <input className="bg-black p-1 w-20 text-white border border-neutral-700" value={editForm.balance} onChange={e=>setEditForm({...editForm, balance: e.target.value})} /> : u.balance}</td><td className="p-3">{editingUser === u.id ? (<button onClick={saveUserEdit} className="text-emerald-500 mr-2"><Save size={18} /></button>) : (<button onClick={()=>handleEditUser(u)} className="text-blue-500 mr-2"><Edit2 size={18}/></button>)}</td></tr>))}</tbody></table></div></div>}
         {tab === 'fin' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div><h3 className="font-bold mb-4 text-emerald-500">Deposits</h3>{db.deposits.map(d => (<div key={d.id} className="bg-neutral-900 p-3 rounded mb-2 border border-neutral-800 flex flex-col gap-2"><div className="flex justify-between items-start"><div><p className="font-bold text-white">User: {d.userName}</p><p className="text-xs text-neutral-500">TRX: {d.trxId} | <span className="text-emerald-400">{d.amount} PKR</span></p></div><button onClick={()=>deleteTx(d.id, 'dep')} className="text-red-500"><Trash2 size={16}/></button></div>{d.status === 'pending' ? (<div className="flex gap-2 mt-1 pt-2 border-t border-neutral-800"><button onClick={()=>processTx(d.id, 'dep', 'approved')} className="text-xs bg-emerald-900/30 text-emerald-500 px-2 py-1 rounded border border-emerald-900">Approve</button><button onClick={()=>processTx(d.id, 'dep', 'rejected')} className="text-xs bg-red-900/30 text-red-500 px-2 py-1 rounded border border-red-900">Reject</button></div>) : <span className={`text-xs capitalize self-start px-2 py-0.5 rounded ${d.status==='approved'?'bg-emerald-900/20 text-emerald-500':'bg-red-900/20 text-red-500'}`}>{d.status}</span>}</div>))}</div><div><h3 className="font-bold mb-4 text-red-500">Withdrawals</h3>{db.withdrawals.map(w => (<div key={w.id} className="bg-neutral-900 p-3 rounded mb-2 border border-neutral-800 flex flex-col gap-2"><div className="flex justify-between items-start"><div><p className="font-bold text-white">User: {w.userName}</p><p className="text-xs text-neutral-500">Acc: {w.account} | <span className="text-red-400">{w.amount} PKR</span></p></div><button onClick={()=>deleteTx(w.id, 'with')} className="text-red-500"><Trash2 size={16}/></button></div>{w.status === 'pending' ? (<div className="flex gap-2 mt-1 pt-2 border-t border-neutral-800"><button onClick={()=>processTx(w.id, 'with', 'approved')} className="text-xs bg-emerald-900/30 text-emerald-500 px-2 py-1 rounded border border-emerald-900">Approve</button><button onClick={()=>processTx(w.id, 'with', 'rejected')} className="text-xs bg-red-900/30 text-red-500 px-2 py-1 rounded border border-red-900">Reject</button></div>) : <span className={`text-xs capitalize self-start px-2 py-0.5 rounded ${w.status==='approved'?'bg-emerald-900/20 text-emerald-500':'bg-red-900/20 text-red-500'}`}>{w.status}</span>}</div>))}</div></div>}
      </div>
    </div>
  );
}

const AdminBtn = ({ icon: Icon, label, active, onClick, collapsed, count }) => (<button onClick={onClick} className={`w-full text-left p-3 rounded flex items-center gap-3 relative ${active ? 'bg-amber-600 text-black font-bold' : 'text-neutral-400 hover:bg-neutral-800'} ${collapsed ? 'justify-center' : ''}`}><Icon size={18} />{!collapsed && <span>{label}</span>}{count > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{count}</span>}</button>);
const NavBtn = ({ icon: Icon, label, active, onClick }) => (<button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-amber-500' : 'text-neutral-500'}`}><Icon size={24} strokeWidth={active?2.5:2} /><span className="text-[10px] font-medium">{label}</span></button>);
function AuthScreen({ onLogin, onRegister, toAdmin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [data, setData] = useState({ name: '', email: '', password: '', refCode: '' });
  useEffect(() => { const params = new URLSearchParams(window.location.search); const ref = params.get('ref'); if(ref) setData(prev => ({ ...prev, refCode: ref })); }, []);
  return (<div className="min-h-screen flex items-center justify-center p-6 relative bg-black"><div className="absolute top-5 right-5 text-neutral-800 hover:text-neutral-600 cursor-pointer" onClick={toAdmin}><Lock size={20} /></div><div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl"><h1 className="text-3xl font-bold text-amber-500 text-center mb-2">Hammad.pk</h1><p className="text-neutral-500 text-center mb-8">Premium Earning</p><div className="space-y-4">{!isLogin && <input placeholder="Full Name" className="w-full bg-black border border-neutral-800 p-3 rounded text-white outline-none focus:border-amber-500" onChange={e=>setData({...data, name: e.target.value})} />}<input placeholder="Email Address" className="w-full bg-black border border-neutral-800 p-3 rounded text-white outline-none focus:border-amber-500" onChange={e=>setData({...data, email: e.target.value})} /><input type="password" placeholder="Password" className="w-full bg-black border border-neutral-800 p-3 rounded text-white outline-none focus:border-amber-500" onChange={e=>setData({...data, password: e.target.value})} />{!isLogin && <input placeholder="Referral Code (Optional)" className="w-full bg-black border border-neutral-800 p-3 rounded text-white outline-none focus:border-amber-500" value={data.refCode} onChange={e=>setData({...data, refCode: e.target.value})} />}<Button full onClick={() => isLogin ? onLogin(data.email, data.password) : onRegister(data)}>{isLogin ? 'Login' : 'Create Account'}</Button></div><p className="text-center mt-6 text-neutral-500 cursor-pointer" onClick={()=>setIsLogin(!isLogin)}>{isLogin ? "Create Account" : "Login Now"}</p></div></div>);
}
function AdminLogin({ onLogin, onBack }) {
  const [creds, setCreds] = useState({user:'', pass:''});
  const check = () => (creds.user === 'hammad' && creds.pass === 'hammad') ? onLogin() : alert('Wrong!');
  return (<div className="h-screen bg-black flex items-center justify-center p-6"><div className="w-full max-w-sm bg-neutral-900 p-8 rounded-2xl border border-neutral-800 text-center"><Shield size={40} className="mx-auto text-amber-500 mb-6" /><h2 className="text-white text-xl font-bold mb-6">Security Check</h2><input placeholder="Username" className="w-full bg-black border border-neutral-800 p-3 rounded text-white mb-3" onChange={e=>setCreds({...creds, user: e.target.value})} /><input type="password" placeholder="Password" className="w-full bg-black border border-neutral-800 p-3 rounded text-white mb-6" onChange={e=>setCreds({...creds, pass: e.target.value})} /><Button full onClick={check}>Unlock Panel</Button><button onClick={onBack} className="mt-4 text-neutral-500 text-sm">Cancel</button></div></div>);
}

