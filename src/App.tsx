import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate,
  Link
} from 'react-router-dom';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  LogOut, 
  Plus, 
  ShieldCheck, 
  User as UserIcon, 
  Wallet,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  DollarSign,
  Users,
  Settings as SettingsIcon,
  CreditCard,
  Mail,
  Lock,
  UserPlus,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from './utils';

// --- Types ---
interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  status: 'none' | 'pending' | 'active' | 'rejected';
  createdAt: any;
}

interface Job {
  id: string;
  title: string;
  description: string;
  reward: number;
  createdAt: any;
  createdBy: string;
}

interface ActivationRequest {
  id: string;
  userId: string;
  userEmail: string;
  transactionId: string;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

interface AppSettings {
  bikashNumber: string;
  nagadNumber: string;
  activationFee: number;
}

// --- Components ---

const Navbar = ({ user, profile }: { user: FirebaseUser | null, profile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">MicroJob BD</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Jobs</Link>
                {profile?.role === 'admin' && (
                  <Link to="/adminpanel" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Admin</Link>
                )}
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile?.status || 'Loading...'}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-gray-600 font-medium">Jobs</Link>
                  {profile?.role === 'admin' && (
                    <Link to="/adminpanel" className="block px-3 py-2 text-gray-600 font-medium">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-500 font-medium">Logout</button>
                </>
              ) : (
                <Link to="/auth" className="block px-3 py-2 text-emerald-600 font-bold">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
              Earn Money by <span className="text-emerald-600">Completing Tasks</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Join the largest micro-job community in Bangladesh. Simple tasks, instant payments, and a reliable platform to grow your income.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/auth" 
                className="bg-emerald-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-emerald-700 transition-all shadow-xl hover:scale-105 flex items-center justify-center"
              >
                Start Earning Now <ChevronRight className="ml-2" />
              </Link>
              <a 
                href="#how-it-works" 
                className="bg-gray-100 text-gray-900 px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-200 transition-all flex items-center justify-center"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <div className="w-20 h-1 bg-emerald-500 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <UserIcon />, title: "Create Account", desc: "Sign up with your Google account in seconds." },
              { icon: <ShieldCheck />, title: "Activate Profile", desc: "Pay a small fee to verify your account and start working." },
              { icon: <Wallet />, title: "Complete & Earn", desc: "Choose from hundreds of jobs and get paid instantly." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"
              >
                <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthPage = ({ user }: { user: FirebaseUser | null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Remove automatic redirect to allow handleAuth to control navigation
  // useEffect(() => {
  //   if (user) navigate('/dashboard');
  // }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = result.user;

        // Create profile for new user
        await setDoc(doc(db, 'users', newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          role: newUser.email === 'rsjonayed07@gmail.com' ? 'admin' : 'user',
          isActive: false,
          status: 'none',
          createdAt: serverTimestamp()
        });
        navigate('/activate');
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full"
      >
        <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-8">
          {isLogin ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          {isLogin ? 'Sign in to access your dashboard' : 'Join our micro-job community today'}
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-emerald-600 font-bold hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ profile }: { profile: UserProfile | null }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (!profile) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="animate-pulse space-y-8">
        <div className="h-32 bg-gray-100 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-gray-100 rounded-3xl"></div>
          <div className="h-40 bg-gray-100 rounded-3xl"></div>
          <div className="h-40 bg-gray-100 rounded-3xl"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Status Banner */}
      {!profile.isActive && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 p-6 rounded-3xl mb-10 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Account Inactive</h3>
              <p className="text-amber-700">You need to activate your account to start working and earning.</p>
            </div>
          </div>
          <Link 
            to="/activate" 
            className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-md"
          >
            {profile.status === 'pending' ? 'Activation Pending' : 'Activate Now'}
          </Link>
        </motion.div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Available Jobs</h2>
          <p className="text-gray-500">Find tasks that match your skills</p>
        </div>
        <div className="flex items-center space-x-4">
          {profile.role === 'admin' && (
            <Link 
              to="/adminpanel" 
              className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-gray-800 transition-all"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              <span>Admin Panel</span>
            </Link>
          )}
          <div className="bg-emerald-50 px-4 py-2 rounded-xl text-emerald-700 font-bold flex items-center">
            <Wallet className="w-4 h-4 mr-2" />
            <span>Balance: 0.00 BDT</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No jobs available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <motion.div 
              key={job.id}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{job.title}</h3>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  {job.reward} BDT
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">{job.description}</p>
              <button 
                disabled={!profile.isActive}
                className="w-full bg-gray-900 text-white py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profile.isActive ? 'Apply Now' : 'Activate to Apply'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const ActivationPage = ({ user, profile }: { user: FirebaseUser | null, profile: UserProfile | null }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [method, setMethod] = useState<'bikash' | 'nagad'>('bikash');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) setSettings(doc.data() as AppSettings);
    });
    return () => unsubscribe();
  }, []);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = profile?.uid || user?.uid;
    const email = profile?.email || user?.email;
    
    if (!uid || !email || !transactionId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'activationRequests'), {
        userId: uid,
        userEmail: email,
        transactionId,
        method,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', uid), {
        status: 'pending'
      });

      setSuccess(true);
    } catch (error) {
      console.error("Activation error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/auth" />;
  if (profile?.isActive) return <Navigate to="/dashboard" />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Activate Your Account</h2>
        
        {success ? (
          <div className="text-center py-10">
            <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
              <Clock className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">অনুরোধ সফল হয়েছে</h3>
            <p className="text-gray-600 mb-8">আপনি কিছুক্ষণ অপেক্ষা করুন আপনার অ্যাকাউন্ট একটিভ হয়ে যাবে। এডমিন আপনার পেমেন্ট যাচাই করে ২৪ ঘণ্টার মধ্যে একাউন্ট একটিভ করে দিবে।</p>
            <Link to="/dashboard" className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold">ড্যাশবোর্ডে ফিরে যান</Link>
          </div>
        ) : (
          <>
            <div className="bg-emerald-50 p-6 rounded-2xl mb-8">
              <p className="text-emerald-800 font-medium mb-4">Follow these steps to activate:</p>
              <ol className="space-y-3 text-emerald-700 text-sm list-decimal list-inside">
                <li>Send <strong>{settings?.activationFee || 100} BDT</strong> to the number below.</li>
                <li>Use "Send Money" option in your Bikash/Nagad app.</li>
                <li>Copy the Transaction ID after successful payment.</li>
                <li>Paste the Transaction ID in the form below and submit.</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
              <button 
                onClick={() => setMethod('bikash')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${method === 'bikash' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}
              >
                <div className="w-12 h-12 bg-pink-500 rounded-xl mb-2 flex items-center justify-center text-white font-bold">b</div>
                <span className="font-bold text-gray-900">Bikash</span>
              </button>
              <button 
                onClick={() => setMethod('nagad')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${method === 'nagad' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}
              >
                <div className="w-12 h-12 bg-orange-500 rounded-xl mb-2 flex items-center justify-center text-white font-bold">n</div>
                <span className="font-bold text-gray-900">Nagad</span>
              </button>
            </div>

            <div className="mb-8">
              <div 
                onClick={() => copyToClipboard(method === 'bikash' ? settings?.bikashNumber || '' : settings?.nagadNumber || '')}
                className="bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">{method} Number</p>
                  <p className="text-xl font-mono font-bold text-gray-900">
                    {method === 'bikash' ? settings?.bikashNumber || '01XXXXXXXXX' : settings?.nagadNumber || '01XXXXXXXXX'}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-emerald-600">
                  {copied ? (
                    <span className="text-sm font-bold flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Copied!</span>
                  ) : (
                    <span className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-all">Click to Copy</span>
                  )}
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID</label>
                <input 
                  type="text" 
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter 10-digit Transaction ID"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Activation Request'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ profile }: { profile: UserProfile | null }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'jobs' | 'settings'>('requests');
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ bikashNumber: '', nagadNumber: '', activationFee: 100 });
  
  // Job Form
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReward, setJobReward] = useState(0);

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const unsubRequests = onSnapshot(query(collection(db, 'activationRequests'), orderBy('createdAt', 'desc')), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivationRequest)));
    }, (error) => {
      console.error("Requests error:", error);
    });

    const unsubJobs = onSnapshot(query(collection(db, 'jobs'), orderBy('createdAt', 'desc')), (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    }, (error) => {
      console.error("Jobs error:", error);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (d) => {
      if (d.exists()) setSettings(d.data() as AppSettings);
    }, (error) => {
      console.error("Settings error:", error);
    });

    return () => {
      unsubRequests();
      unsubJobs();
      unsubSettings();
    };
  }, [profile]);

  const handleApprove = async (req: ActivationRequest) => {
    try {
      await updateDoc(doc(db, 'activationRequests', req.id), { status: 'approved' });
      await updateDoc(doc(db, 'users', req.userId), { 
        isActive: true, 
        status: 'active' 
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (req: ActivationRequest) => {
    try {
      await updateDoc(doc(db, 'activationRequests', req.id), { status: 'rejected' });
      await updateDoc(doc(db, 'users', req.userId), { 
        isActive: false, 
        status: 'rejected' 
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'jobs'), {
        title: jobTitle,
        description: jobDesc,
        reward: Number(jobReward),
        createdAt: serverTimestamp(),
        createdBy: profile?.uid
      });
      setJobTitle('');
      setJobDesc('');
      setJobReward(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert('Settings updated!');
    } catch (error) {
      console.error(error);
    }
  };

  if (profile?.role !== 'admin') return <Navigate to="/dashboard" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'requests' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users className="w-5 h-5" />
            <span>Requests</span>
          </button>
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'jobs' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Jobs</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          {activeTab === 'requests' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Activation Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map(req => (
                      <tr key={req.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">{req.userEmail}</td>
                        <td className="px-6 py-4 capitalize">{req.method}</td>
                        <td className="px-6 py-4 font-mono text-sm">{req.transactionId}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {req.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button onClick={() => handleApprove(req)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><CheckCircle className="w-5 h-5" /></button>
                              <button onClick={() => handleReject(req)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Job</h3>
                <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Job Title</label>
                    <input type="text" required value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea required value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none h-32" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reward (BDT)</label>
                    <input type="number" required value={jobReward} onChange={e => setJobReward(Number(e.target.value))} className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all">Create Job</button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">Existing Jobs</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {jobs.map(job => (
                    <div key={job.id} className="p-6 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-500">{job.reward} BDT</p>
                      </div>
                      <button className="text-red-500 hover:text-red-700 font-bold text-sm">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Global Settings</h3>
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bikash Number</label>
                    <input type="text" value={settings.bikashNumber} onChange={e => setSettings({...settings, bikashNumber: e.target.value})} className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nagad Number</label>
                    <input type="text" value={settings.nagadNumber} onChange={e => setSettings({...settings, nagadNumber: e.target.value})} className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Activation Fee (BDT)</label>
                    <input type="number" value={settings.activationFee} onChange={e => setSettings({...settings, activationFee: Number(e.target.value)})} className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <button type="submit" className="bg-gray-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">Save Settings</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Set loading to false immediately so the app can render
        setLoading(false);
        
        // Listen to profile changes in the background
        const profileUnsub = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            // Force admin role if email matches
            if (firebaseUser.email === 'rsjonayed07@gmail.com' && data.role !== 'admin') {
              updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' });
              setProfile({ ...data, role: 'admin' });
            } else {
              setProfile(data);
            }
          } else if (firebaseUser.email === 'rsjonayed07@gmail.com') {
            // Create admin profile if it doesn't exist
            const adminProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: 'admin',
              isActive: true,
              status: 'active',
              createdAt: serverTimestamp()
            };
            setDoc(doc(db, 'users', firebaseUser.uid), adminProfile);
            setProfile(adminProfile);
          }
        }, (error) => {
          console.error("Profile error:", error);
        });
        return () => profileUnsub();
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Safety timeout: stop loading after 5 seconds regardless of Firebase state
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="bg-emerald-500 p-4 rounded-2xl"
        >
          <Briefcase className="w-10 h-10 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-gray-900">
        <Navbar user={user} profile={profile} />
        <main>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/auth" element={<AuthPage user={user} />} />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard profile={profile} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/activate" 
              element={user ? <ActivationPage user={user} profile={profile} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/adminpanel" 
              element={user && profile?.role === 'admin' ? <AdminDashboard profile={profile} /> : <Navigate to="/dashboard" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
