import { CredentialsSignin } from "next-auth";

export class AppError extends Error {

  constructor(message: string, public status?: number, code?:string) {

    super(message);
    this.name = this.constructor.name
  }

}

export class TimeoutError extends AppError {

  constructor(message="Os dados demoram demais para serem entregues", ) {

    super(message)
    this.name = "InvalidFieldsError"
    this.name = "TimeoutError"
  }

}

export class UnexpectedError extends AppError {

  constructor(message="Ocorreu um erro inesperado!", cause?:unknown) {

    super(message, 500)
    this.name = "UnexpectedError"
    this.cause = cause

  }

}


export class InvalidFieldsError extends CredentialsSignin {

  constructor(message="Os dados fornecidos não condizem com os requisitos.", cause?:unknown) {

    super(message)
    this.name = "InvalidFieldsError"
    this.code = "invalid_fields"

  }

}
