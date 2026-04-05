import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useSignupUser, useSendVerificationEmail, useVerifyEmail, useGoogleLoginUser } from '@/features/auth/authService';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OTPInput from '@/components/OTPInput';
import { GoogleLogin } from "@react-oauth/google";
import { BUSINESS_CONFIG } from "@/config/business.config";

interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const signupMutation = useSignupUser();
  const sendOtpMutation = useSendVerificationEmail();
  const verifyMutation = useVerifyEmail();
  const googleLoginMutation = useGoogleLoginUser();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignupForm | null>(null);
  const [otpToken, setOtpToken] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [shakeOtp, setShakeOtp] = useState(false);
  const [timer, setTimer] = useState(45);

  const loading =
    signupMutation.isPending ||
    sendOtpMutation.isPending ||
    verifyMutation.isPending ||
    googleLoginMutation.isPending;

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>();

  useEffect(() => {
    if (step !== 'otp') return;
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const onFormSubmit = async (data: SignupForm) => {
    setFormData(data);
    sendOtpMutation.mutate({ email: data.email }, {
      onSuccess: (res) => {
        setOtpToken(res.data.otpToken);
        setStep('otp');
        setTimer(45);
        toast.success(`OTP sent to ${data.email}`);
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to send OTP');
      },
    });
  };

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) return;
    verifyMutation.mutate({ otp, token: otpToken }, {
      onSuccess: () => {
        // OTP verified, now create account
        signupMutation.mutate(
          { userName: formData!.name, email: formData!.email, phone: formData!.phone, password: formData!.password },
          {
            onSuccess: (res) => {
              setAuthData(res.data.user, res.data.accessToken);
              toast.success(`Welcome to ${BUSINESS_CONFIG.company.name}, ${formData!.name}! ♛`);
              navigate('/');
            },
            onError: (err) => {
              toast.error(err.message || 'Signup failed');
            },
          }
        );
      },
      onError: (err) => {
        setOtpError(err.message || 'Incorrect OTP. Try again.');
        setShakeOtp(true);
        setTimeout(() => setShakeOtp(false), 600);
      },
    });
  }, [otp, otpToken, formData, signupMutation, verifyMutation, setAuthData, navigate]);

  const handleGoogleSignup = async () => {
    toast.info('Google Sign-Up will be connected to your backend.');
  };

  const handleResend = async () => {
    if (!formData) return;
    sendOtpMutation.mutate({ email: formData.email }, {
      onSuccess: (res) => {
        setOtpToken(res.data.otpToken);
        setTimer(45);
        toast.success(`OTP resent to ${formData.email}`);
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to resend OTP');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-md mx-auto">
          {step === 'form' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-heading text-3xl font-bold mb-2">Create Account</h1>
              <p className="font-body text-muted-foreground mb-8">Join the {BUSINESS_CONFIG.company.name} community</p>

              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Full Name <span className="text-primary">*</span></label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  {errors.name && <p className="font-mono text-[10px] text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Email <span className="text-primary">*</span></label>
                  <input
                    {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                    type="email"
                    className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  {errors.email && <p className="font-mono text-[10px] text-destructive mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Phone Number <span className="text-primary">*</span></label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-muted border border-r-0 border-border font-mono text-xs text-muted-foreground">+91</span>
                    <input
                      {...register('phone', { required: 'Phone is required', pattern: { value: /^\d{10}$/, message: 'Enter 10-digit number' } })}
                      type="tel"
                      maxLength={10}
                      placeholder="98765 43210"
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  {errors.phone && <p className="font-mono text-[10px] text-destructive mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Password <span className="text-primary">*</span></label>
                  <div className="relative">
                    <input
                      {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3.5 bg-card border border-border font-body text-foreground focus:border-primary focus:outline-none transition-colors pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="font-mono text-[10px] text-destructive mt-1">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50">
                  {loading ? 'Sending OTP...' : 'Create Account'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center"><span className="bg-background px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">or</span></div>
                </div>

                <div className="w-full overflow-hidden flex justify-center relative">
                  {googleLoginMutation.isPending && (
                    <div className="absolute inset-0 z-10 bg-background/80 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">Verifying...</span>
                      </div>
                    </div>
                  )}
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        googleLoginMutation.mutate(
                          { token: credentialResponse.credential },
                          {
                            onSuccess: (res) => {
                              setAuthData(res.data.user, res.data.accessToken);
                              toast.success(`Welcome to ${BUSINESS_CONFIG.company.name}, ${res.data.user.userName}! ♛`);
                              navigate('/');
                            },
                            onError: (err) => {
                              toast.error(err.message || "Google Sign-Up failed");
                            },
                          }
                        );
                      }
                    }}
                    onError={() => {
                      toast.error("Google authentication failed.");
                    }}
                  />
                </div>
              </form>

              <p className="text-center font-body text-sm text-muted-foreground mt-8">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-mono text-xs uppercase">Sign In</Link>
              </p>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <span className="text-5xl block mb-4">♛</span>
              <h1 className="font-heading text-3xl font-bold mb-2">Verify Your Email</h1>
              <p className="font-body text-muted-foreground mb-8">
                Enter the 6-digit code sent to {formData?.email}
              </p>

              <div className="mb-6">
                <OTPInput value={otp} onChange={(v) => { setOtp(v); setOtpError(''); }} shake={shakeOtp} />
                {otpError && <p className="font-mono text-xs text-destructive mt-3">{otpError}</p>}
              </div>

              <div className="mb-6">
                {timer > 0 ? (
                  <p className="font-mono text-xs text-muted-foreground">
                    Resend OTP in 0:{timer.toString().padStart(2, '0')}
                  </p>
                ) : (
                  <button onClick={handleResend} className="font-mono text-xs text-primary hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={handleVerify}
                disabled={otp.length !== 6 || loading}
                className="w-full py-4 bg-secondary text-secondary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                onClick={() => setStep('form')}
                className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary mt-6 mx-auto"
              >
                <ArrowLeft size={14} /> Change Email
              </button>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
