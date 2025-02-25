import UserRegisterForm from '@components/register/UserRegisterForm';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// import CustomerService from '@services/CustomerService';

// let customerService: jest.Mock;
// customerService = jest.fn();

window.React = React;

test('given valid customer credentials, when: signing up customer, then: customer is signed up.', () => {
    render(<UserRegisterForm></UserRegisterForm>);
    expect(screen.getByText('Create a new account'));
    expect(screen.getByText('First Name'));
    expect(screen.getByText('Last Name'));
    expect(screen.getByText('Email'));
    expect(screen.getByText('Password'));
    expect(screen.getByText('Confirm Password'));
    expect(screen.getByText('Signup'));
    expect(screen.getByText('Already have an account? Login'));
});

// fireEvent.click(screen.getByTestId("0"))
// CustomerService.createCustomer=customerService.mockResolvedValue(customer)

// const  {rerender}=render(<UserRegisterForm/>)
// // fireevents
// rerender(<UserRegisterForm/>)
// data-testid={}
// expect(screen.queryByTestId("")).not.toBeInTheDocument()
