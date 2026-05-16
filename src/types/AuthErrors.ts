export class InvalidCredentialsError extends Error {
    constructor() {
        super("Email ou senha inválidos")
        this.name = "InvalidCredentialsError"
    }
}

export class EmailAlreadyExistsError extends Error {
    constructor() {
        super("Esse email já possui conta")
        this.name = "EmailAlreadyExistsError"
    }
}

export class DatabaseError extends Error {
    constructor(cause?: unknown) {
        super("Erro interno, tente novamente")
        this.name = "DatabaseError"
        this.cause = cause // ← guarda o erro original
    }
}