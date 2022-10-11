class LoginError extends Error {  
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'LoginError';
    }
}  

export default { LoginError };
