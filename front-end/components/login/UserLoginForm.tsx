import CustomerService from '@services/CustomerService';
import { StatusMessage } from '@types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

const UserLoginForm: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

    const clearErrors = () => {
        setEmailError(null);
        setPasswordError(null);
        setStatusMessages([]);
    };

    const validate = (): boolean => {
        let result = true;

        if (!email || email.trim() === '') {
            setEmailError('Email is required.');
            result = false;
        }
        if (!password || password.trim() === '') {
            setPasswordError('Password is required.');
            result = false;
        }

        return result;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        clearErrors();

        if (!validate()) {
            return;
        }

        const userToLogin = { email, password };
        const response = await CustomerService.loginCustomer(userToLogin);

        if (response.status === 200) {
            setStatusMessages([
                {
                    message: 'Login successful. Redirecting to homepage...',
                    type: 'success',
                },
            ]);
            const user = await response.json();
            sessionStorage.setItem(
                'loggedInUser',
                JSON.stringify({
                    token: user.token,
                    email: user.email,
                    fullname: user.fullname,
                    role: user.role,
                })
            );
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } else {
            setStatusMessages([
                {
                    message: 'Login unsuccessful.',
                    type: 'error',
                },
            ]);
        }
    };

    return (
        <div className="flex items-start justify-center min-h-screen bg-white pt-10">
            <div className="w-full sm:max-w-lg p-10 space-y-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold leading-tight text-gray-900">
                    Log in to your account
                </h1>

                {statusMessages && (
                    <div className="row">
                        <ul className="list-none mb-3 mx-auto">
                            {statusMessages.map(({ message, type }, index) => (
                                <li
                                    key={index}
                                    className={classNames({
                                        'text-red-800': type === 'error',
                                        'text-green-800': type === 'success',
                                    })}
                                >
                                    {message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            Your email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email ?? ''}
                            onChange={(event) => setEmail(event.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="name@company.com"
                        />
                        {emailError && <div className="text-red-800">{emailError}</div>}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={password ?? ''}
                            onChange={(event) => setPassword(event.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="••••••••"
                        />
                        {passwordError && <div className="text-red-800">{passwordError}</div>}
                    </div>

                    <button
                        type="submit"
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                        Log in
                    </button>
                </form>

                <p className="text-sm font-light text-gray-500">
                    Don’t have an account yet?{' '}
                    <a
                        href="#"
                        className="font-medium text-blue-600 hover:underline"
                        onClick={() => router.push('/register')}
                    >
                        Register account
                    </a>
                </p>
            </div>
        </div>
    );
};

export default UserLoginForm;
