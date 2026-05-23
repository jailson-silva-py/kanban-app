export class AppError extends Error {

  constructor(message: string, public status?: number) {

    super(message);
    this.name = this.constructor.name

  }

}

export class UnexpectedError extends AppError {

  constructor(message="Ocorreu um erro inesperado!", cause?:unknown) {

    super(message, 500)
    this.name = "UnexpectedError"
    this.cause = cause

  }

}


export class InvalidFieldsError extends AppError {

  constructor(message="Os dados fornecidos não condizem com os requisitos.", cause?:unknown) {

    super(message, 422)
    this.name = "InvalidFieldsError"
    this.cause = cause

  }

}
