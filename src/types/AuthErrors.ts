import { AppError } from "./GlobalErrors"

export class InvalidCredentialsError extends AppError {
    constructor() {
        super("Email ou senha inválidos")
        this.name = "InvalidCredentialsError"
    }
}

export class EmailAlreadyExistsError extends AppError {
    constructor() {
        super("Esse email já possui conta")
        this.name = "EmailAlreadyExistsError"
    }
}

export class DatabaseError extends AppError {
    constructor(cause?: unknown) {
        super("Erro interno, tente novamente")
        this.name = "DatabaseError"
        this.cause = cause // ← guarda o erro original
    }
}

export class UnAuthentichatedError extends AppError {

  constructor(cause?:unknown, public status?: number) {

    super("Por favor, faça login para continuar!")
    this.name = "UnAuthentichatedError"
    this.status = 401;
    this.cause = cause;

  }
}

export class AccessDeniedError extends AppError {

  constructor(cause?:unknown, public status?:number) {
    super("Acesso negado.")
    this.name = "AccessDeniedError";
    this.status = 403;
    this.cause = cause;

  }
}

export class InvalidMethodAccessError extends AppError {

  constructor(cause?:unknown, public status?:number) {
    super("Método de acesso inválido, tente outro.")
    this.name = "InvalidMethodAccessError";
    this.status = 403;
    this.cause = cause;

  }

}
