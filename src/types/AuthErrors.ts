import { CredentialsSignin } from "next-auth"
import { AppError } from "./GlobalErrors"

export class InvalidCredentialsError extends CredentialsSignin {
    constructor() {
      super("Email ou senha inválidos")
      this.name = "InvalidCredentialsError"
      this.code = "invalid_login"
    }
}

export class EmailAlreadyExistsError extends CredentialsSignin {
    constructor() {
        super("Esse email já possui conta")
      this.code = "unavaliable_email"
      this.name = "EmailAlreadyExists"
    }
}

export class DatabaseError extends AppError {
    constructor(cause?: unknown) {
        super("Erro interno, tente novamente")
        this.name = "DatabaseError"
        this.cause = cause // ← guarda o erro original
    }
}

export class UnAuthentichatedError extends CredentialsSignin {

  constructor(public status?: number) {

    super("Por favor, faça login para continuar!")
    this.name = "UnAuthentichatedError"
    this.status = 401;

  }
}

export class AccessDeniedError extends CredentialsSignin {

  constructor(public status?:number) {
    super("Acesso negado.")
    this.name = "AccessDeniedError";
    this.status = 403;
  }
}

export class InvalidMethodAccessError extends CredentialsSignin {

  constructor(public status?:number) {
    super("Método de acesso inválido, tente outro.")
    this.name = "InvalidMethodAccessError";
    this.status = 403;
    this.code = "invalid_method_access"

  }

}
