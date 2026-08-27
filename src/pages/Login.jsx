import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, ShieldAlert } from 'lucide-react';
import { Form, Input, Button } from 'antd';

const Login = () => {
  const { login, error: authError, sessionExpiredNotice, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setFormError('');
      await login(values.email, values.password);
    } catch (err) {
      setFormError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const displayMessage = formError || sessionExpiredNotice || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[60%] rounded-full bg-brand-400/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4">
            <Compass className="w-8 h-8 text-white stroke-[1.5]" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">
            Roamigo <span className="text-brand-600">Admin</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Luxury Vacation Rentals Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Sign In</h2>

          {displayMessage && (
            <div className={`flex items-start gap-3 rounded-2xl p-4 mb-6 text-sm ${
              sessionExpiredNotice 
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${sessionExpiredNotice ? 'text-amber-600' : 'text-red-500'}`} />
              <div>{displayMessage}</div>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            initialValues={{ email: 'admin@gmail.com', password: 'admin@123' }}
            onFinish={handleSubmit}
            requiredMark={false}
            onChange={() => {
              setFormError('');
              setError(null);
            }}
            className="space-y-2"
          >
            <Form.Item
              label={<span className="text-slate-700 text-sm font-medium">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
              className="mb-4"
            >
              <Input
                prefix={<Mail className="w-4 h-4 text-slate-400 mr-1.5" />}
                placeholder="admin@roamigo.in"
                size="large"
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl py-3 text-sm hover:border-brand-500 focus:border-brand-500"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-slate-700 text-sm font-medium">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please enter password' }]}
              className="mb-6"
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-slate-400 mr-1.5" />}
                placeholder="••••••••"
                size="large"
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl py-3 text-sm hover:border-brand-500 focus:border-brand-500"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold border-none shadow-md shadow-brand-500/20"
              >
                Sign In to Dashboard
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Quick Help note */}
        <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
          Use administrator credentials:<br />
          <span className="text-slate-700 font-mono font-semibold">admin@roamigo.in</span> / <span className="text-slate-700 font-mono font-semibold">Password123</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
