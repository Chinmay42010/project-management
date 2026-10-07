import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authApi } from '../../api/client';

export function VerifyEmailPage() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, ok: false, message: '' });

  useEffect(() => {
    authApi.verifyEmail(token)
      .then((res) => setState({ loading: false, ok: true, message: res.data?.message || 'Email verified. You can sign in now.' }))
      .catch((err) => setState({ loading: false, ok: false, message: err.response?.data?.message || 'Verification failed or link expired.' }));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8F8F8]">
      <div className="w-full max-w-[420px] bg-white rounded-[8px] border border-[#DDDDDD] p-6 text-center">
        <h2 className="text-[22px] font-bold">Email verification</h2>
        <p className={`mt-3 text-[13px] ${state.ok ? 'text-[#2EB67D]' : 'text-[#696969]'}`}>
          {state.loading ? 'Verifying…' : state.message}
        </p>
        {!state.loading && <Link to="/login" className="mt-4 inline-block text-[13px] font-bold text-[#1264A3] hover:underline">Go to sign in</Link>}
      </div>
    </div>
  );
}
