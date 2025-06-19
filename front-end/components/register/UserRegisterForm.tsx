import CustomerService from '@services/CustomerService';
import { Customer, StatusMessage } from '@types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

const UserRegisterForm: React.FC = () => {
    const router = useRouter();
    const [firstName, setFirstName] = useState<string | null>('');
    const [firstNameError, setFirstNameError] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>('');
    const [lastNameError, setLastNameError] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>('');
    const [confirmationPassword, setConfirmationPassword] = useState<string | null>('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmationPasswordError, setConfirmationPasswordError] = useState<string | null>(null);
    const [passwordMatchError, setPasswordMatchError] = useState<string | null>(null);
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

    const clearErrors = () => {
        setFirstNameError(null);
        setLastNameError(null);
        setEmailError(null);
        setPasswordError(null);
        setConfirmationPasswordError(null);
        setPasswordMatchError(null);
        setStatusMessages([]);
    };

    const validate = (): boolean => {
        let result = true;

        if (!firstName || firstName.trim() === '') {
            setFirstNameError('FirstName is required.');
            result = false;
        }

        if (!lastName || lastName.trim() === '') {
            setLastNameError('Lastname is required.');
            result = false;
        }

        if (!email || email.trim() === '') {
            setEmailError('Email is required.');
            result = false;
        }
        if (!password || password.trim() === '') {
            setPasswordError('Password is required.');
            result = false;
        }

        if (!confirmationPassword || confirmationPassword.trim() === '') {
            setConfirmationPasswordError('Confirmation password is required.');
            result = false;
        }

        if (password !== confirmationPassword) {
            setPasswordMatchError('Passwords must match.');
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
        const customerInput: Customer = {
            firstName: firstName!,
            lastName: lastName!,
            email: email!,
            password: password!,
        };

        const response = await CustomerService.createCustomer(customerInput);
        if (response.status === 200) {
            setStatusMessages([
                {
                    message: 'Signup successful. Redirecting to loginpage...',
                    type: 'success',
                },
            ]);
            setTimeout(() => router.push('/login'), 2000);
        } else if (response.status === 400) {
            const errorBody = await response.json();
            if ((errorBody.message = 'Customer ID is required to create a cart')) {
                setStatusMessages([
                    {
                        message: 'Signup successful. Redirecting to loginpage...',
                        type: 'success',
                    },
                ]);
                setTimeout(() => router.push('/login'), 2000);
            }
        } else if (response.status === 500) {
            const errorBody = await response.json();
            if ((errorBody.message = 'Customer ID is required to create a cart')) {
                setStatusMessages([
                    {
                        message: 'Signup successful. Redirecting to loginpage...',
                        type: 'success',
                    },
                ]);
                setTimeout(() => router.push('/login'), 2000);
            }
        } else {
            setStatusMessages([
                {
                    message: 'Signup unsuccessful.',
                    type: 'error',
                },
            ]);
        }
    };

    return (
        <div className="flex items-start justify-center min-h-screen bg-white pt-10">
            <div className="w-full sm:max-w-lg p-10 space-y-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold leading-tight text-gray-900">
                    Create a new account
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
                            htmlFor="firstName"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName ?? ''}
                            onChange={(event) => setFirstName(event.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="First Name"
                        />
                        {firstNameError && <div className="text-red-800">{firstNameError}</div>}
                    </div>

                    <div>
                        <label
                            htmlFor="lastName"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName ?? ''}
                            onChange={(event) => setLastName(event.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Last Name"
                        />
                        {lastNameError && <div className="text-red-800">{lastNameError}</div>}
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email ?? ''}
                            onChange={(event) => setEmail(event.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Email"
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
                            id="password"
                            value={password ?? ''}
                            onChange={(event) => setPassword(event.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Password"
                        />
                        {passwordError && <div className="text-red-800">{passwordError}</div>}
                    </div>

                    <div>
                        <label
                            htmlFor="confirmationPassword"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmationPassword"
                            value={confirmationPassword ?? ''}
                            onChange={(event) => setConfirmationPassword(event.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Confirm your password"
                        />
                        {confirmationPasswordError && (
                            <div className="text-red-800">{confirmationPasswordError}</div>
                        )}
                        {passwordMatchError && !confirmationPasswordError && (
                            <div className="text-red-800">{passwordMatchError}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                        Signup
                    </button>
                </form>

                <p className="text-sm font-light text-gray-500">
                    Already have an account?{' '}
                    <a
                        href="#"
                        className="font-medium text-blue-600 hover:underline"
                        onClick={() => router.push('/login')}
                    >
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default UserRegisterForm;
