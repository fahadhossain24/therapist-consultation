export const generateTransactionId = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 10;
    let transactionId = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        transactionId += characters[randomIndex];
    }

    return transactionId;
};
