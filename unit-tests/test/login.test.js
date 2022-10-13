import { describe, expect, test } from '@jest/globals';
import mathOperations from '../src/login';
import customer from '../../customer.js'

describe('Calculator Tests', () => {
    test('sign in test', () => {
        let login = customer.signIn(req, res);

        expect(login).toBe(true);
    });


    test('Addition of 2 numbers', () => {
        // arrange and act
        let result = mathOperations.sum(1, 2);

        // assert
        expect(result).toBe(3);
    });

    test('Subtraction of 2 numbers', () => {
        // arrange and act
        let result = mathOperations.diff(10, 2);

        // assert
        expect(result).toBe(8);
    });

    test('Multiplication of 2 numbers', () => {
        // arrange and act
        let result = mathOperations.product(2, 8);

        // assert
        expect(result).toBe(16);
    });

    test('Division of 2 numbers', () => {
        // arrange and act
        let result = mathOperations.divide(24, 8);

        // assert
        expect(result).toBe(3);
    });
});