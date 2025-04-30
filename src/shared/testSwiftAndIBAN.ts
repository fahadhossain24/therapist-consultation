import CustomError from '../app/errors';

export function isVerifiedSwiftAndIban(swiftCode: string, iban: string) {
    console.log('request come');
    // Step 1: Format Validation
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

    if (!swiftRegex.test(swiftCode)) {
        throw new CustomError.BadRequestError('Invalid SWIFT code format!');
    }

    if (!ibanRegex.test(iban)) {
        throw new CustomError.BadRequestError('Invalid IBAN format!');
    }

    // Step 2: Existence Verification
    // Use an external API to verify the SWIFT code and IBAN
    // const apiKey = 'your_api_key';
    // const swiftApiUrl = `https://api.example.com/validate/swift/${swiftCode}?api_key=${apiKey}`;
    // const ibanApiUrl = `https://api.example.com/validate/iban/${iban}?api_key=${apiKey}`;

    // Make API requests and handle responses
    // ...]
    return;
}
