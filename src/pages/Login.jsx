import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, ShieldAlert } from 'lucide-react';
import { Form, Input, Button } from 'antd';

const Login = () => {
  const { login, error: authError, setError } = useAuth();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[60%] rounded-full bg-brand-500/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4 animate-pulse">
            <Compass className="w-8 h-8 text-white stroke-[1.5]" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">
            Roamigo <span className="text-brand-400">Admin</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Luxury Vacation Rentals Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111827]/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {(formError || authError) && (
            <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-2xl p-4 mb-6 text-red-300 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>{formError || authError}</div>
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
              label={<span className="text-gray-400 text-sm font-medium">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
              className="mb-4"
            >
              <Input
                prefix={<Mail className="w-4 h-4 text-gray-500 mr-1.5" />}
                placeholder="admin@roamigo.in"
                size="large"
                className="bg-gray-900/50 border-gray-800 text-white placeholder-gray-600 rounded-2xl py-3 text-sm hover:border-brand-500 focus:border-brand-500"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-400 text-sm font-medium">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please enter password' }]}
              className="mb-6"
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-gray-500 mr-1.5" />}
                placeholder="••••••••"
                size="large"
                className="bg-gray-900/50 border-gray-800 text-white placeholder-gray-600 rounded-2xl py-3 text-sm hover:border-brand-500 focus:border-brand-500"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-12 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold border-none shadow-lg shadow-brand-600/10"
              >
                Sign In to Dashboard
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Quick Help note */}
        <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
          Use the seeded administrator credentials:<br />
          <span className="text-gray-400 font-mono">admin@roamigo.in</span> / <span className="text-gray-400 font-mono">Password123</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

