import DiscountService from '@services/DiscountService';
import ProductService from '@services/ProductService';
import { DiscountCode, Product, StatusMessage } from '@types';
import classNames from 'classnames';
import { useState, useEffect, FormEvent } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    discountToUpdate?: DiscountCode | null;
};

const DiscountCodeEditor: React.FC<Props> = ({ isOpen, onClose, onSave, discountToUpdate }) => {
    const [code, setCode] = useState('');
    const [type, setType] = useState('');
    const [value, setValue] = useState<number>(0);
    const [expirationDate, setExpirationDate] = useState('');
    const [isActive, setIsActive] = useState('false');

    const [codeError, setCodeError] = useState<string | null>(null);
    const [valueError, setValueError] = useState<string | null>(null);
    const [expirationDateError, setExpirationDateError] = useState<string | null>(null);

    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    const [updatingDiscount, setUpdatingDiscount] = useState(false);

    const clearErrors = () => {
        setCodeError(null);
        setValueError(null);
        setExpirationDateError(null);
        setStatusMessages([]);
    };

    const validate = (validExpirationDate: Date) => {
        let isValid = true;

        if (!code || code.trim() === '') {
            setCodeError('Code is required.');
            isValid = false;
        }
        if (!value) {
            setValueError('Value is required.');
            isValid = false;
        } else if (value < 0) {
            setValueError('Value may not be negative.');
            isValid = false;
        } else if (type === 'percentage' && value > 100) {
            setValueError('Percentage must be lower than 100%.');
            isValid = false;
        }
        const datePattern = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!expirationDate || expirationDate.trim() === '') {
            setExpirationDateError('ExpirationDate is required.');
            isValid = false;
        } else if (!datePattern.test(expirationDate)) {
            setExpirationDateError('ExpirationDate must be in format dd/mm/yyyy.');
            isValid = false;
        } else if (validExpirationDate.getTime() < new Date().getTime()) {
            setExpirationDateError('ExpirationDate must be in the future.');
            isValid = false;
        }
        return isValid;
    };

    const handleUpdateDiscount = async (request: DiscountCode) => {
        const response = await DiscountService.updateDiscountCode(code, request);
        if (response.ok) {
            const discount = await response.json();
            setStatusMessages([
                {
                    message: 'Updated discount code: ' + discount.code,
                    type: 'success',
                },
            ]);
            setTimeout(onSave, 1000);
        } else {
            const error = await response.json();
            setStatusMessages([
                {
                    message: 'Failed to update discount code: ' + error.message,
                    type: 'error',
                },
            ]);
        }
    };

    const handleCreateDiscount = async (request: DiscountCode) => {
        const response = await DiscountService.createDiscountCode(request);
        if (response.ok) {
            const discount = await response.json();
            setStatusMessages([
                {
                    message: 'Created discount code: ' + discount.code,
                    type: 'success',
                },
            ]);
            setTimeout(onSave, 1000);
        } else {
            const error = await response.json();
            setStatusMessages([
                {
                    message: 'Failed to create discount code: ' + error.message,
                    type: 'error',
                },
            ]);
        }
    };

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();

        clearErrors();

        const [day, month, year] = expirationDate.split('/').map(Number);
        const validExpirationDate = new Date(year, month - 1, day);

        if (!validate(validExpirationDate)) {
            return;
        }
        let isActiveBoolean;
        if (isActive === 'true') {
            isActiveBoolean = true;
        } else {
            isActiveBoolean = false;
        }

        const request: DiscountCode = {
            code,
            type,
            value,
            expirationDate: validExpirationDate,
            isActive: isActiveBoolean,
        };

        if (updatingDiscount) {
            handleUpdateDiscount(request);
        } else {
            handleCreateDiscount(request);
        }
    };

    useEffect(() => {
        if (discountToUpdate) {
            setCode(discountToUpdate.code);
            setType(discountToUpdate.type);
            setValue(discountToUpdate.value);
            const formattedDate = new Date(discountToUpdate.expirationDate).toLocaleDateString(
                'en-GB'
            );
            setExpirationDate(formattedDate);
            setIsActive(discountToUpdate.isActive.toString());
            setUpdatingDiscount(true);
        } else {
            setCode('');
            setType('fixed');
            setValue(0);
            setExpirationDate('');
            setIsActive('false');
            setUpdatingDiscount(false);
        }
        clearErrors();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-screen-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    &#x2715;
                </button>

                {!updatingDiscount && (
                    <h2 className="text-2xl font-bold mb-6">Create discount code</h2>
                )}
                {updatingDiscount && (
                    <h2 className="text-2xl font-bold mb-6">Update discount code</h2>
                )}
                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="col-span-1">
                            <label className="block mb-1 text-sm font-semibold text-yellow-500">
                                Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                }}
                                className="w-full p-2 border border-gray-300 rounded outline-none"
                            >
                                <option value={'fixed'} key={'fixed'}>
                                    fixed
                                </option>
                                <option value={'percentage'} key={'percentage'}>
                                    percentage
                                </option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block mb-1 text-sm font-semibold text-yellow-500">
                                Value
                            </label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded outline-none"
                            />

                            {valueError && <p className="text-red-500 text-sm">{valueError}</p>}
                        </div>
                        <div className="col-span-1">
                            <label className="block mb-1 text-sm font-semibold text-yellow-500">
                                Expiration date
                            </label>
                            <input
                                type="text"
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded outline-none"
                            />

                            {expirationDateError && (
                                <p className="text-red-500 text-sm">{expirationDateError}</p>
                            )}
                        </div>
                        <div className="col-span-1">
                            <label className="block mb-1 text-sm font-semibold text-yellow-500">
                                isActive
                            </label>
                            <select
                                value={isActive}
                                onChange={(e) => {
                                    setIsActive(e.target.value);
                                }}
                                className="w-full p-2 border border-gray-300 rounded outline-none"
                            >
                                <option value={'false'} key={'false'}>
                                    false
                                </option>
                                <option value={'true'} key={'true'}>
                                    true
                                </option>
                            </select>
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

export default DiscountCodeEditor;
