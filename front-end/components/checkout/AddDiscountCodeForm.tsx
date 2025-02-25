import CartService from '@services/CartService';
import ProductService from '@services/ProductService';
import { Product, StatusMessage } from '@types';
import classNames from 'classnames';
import { useState, useEffect, FormEvent } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    email: string;
};

const AddDiscountCodeForm: React.FC<Props> = ({ isOpen, onClose, onSave, email }) => {
    const [code, setCode] = useState('');

    const [codeError, setCodeError] = useState<string | null>(null);
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

    const clearErrors = () => {
        setCodeError(null);
        setStatusMessages([]);
    };

    const validate = () => {
        let isValid = true;

        if (!code || code.trim() === '') {
            setCodeError('Code is required.');
            isValid = false;
        }
        return isValid;
    };

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();

        clearErrors();

        if (!validate()) {
            return;
        }
        const response = await CartService.addDiscountCodeToCart(email, code);
        if (response.ok) {
            const discountCode = await response.json();
            onSave();
            setStatusMessages([
                {
                    message: 'Added discountcode: ' + discountCode.code,
                    type: 'success',
                },
            ]);
            setTimeout(onClose, 1000);
        } else {
            const error = await response.json();
            setStatusMessages([
                {
                    message: 'Failed to add discountcode: ' + error.message,
                    type: 'error',
                },
            ]);
        }
    };

    useEffect(() => {
        setCode('');
        clearErrors();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-2/5 max-w-screen-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    &#x2715;
                </button>

                <h2 className="text-2xl font-bold mb-6">Add discount code</h2>
                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="col-span-1">
                            <label className="block mb-1 text-sm font-semibold text-yellow-500">
                                Code
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded outline-none"
                            />
                            {codeError && <p className="text-red-500 text-sm">{codeError}</p>}
                        </div>
                        <button
                            className="mt-6 w-full p-2 bg-yellow-500 text-white font-semibold rounded"
                            type="submit"
                        >
                            Save
                        </button>
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
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDiscountCodeForm;
