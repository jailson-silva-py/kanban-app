type ModeType = "warning" | "error" | "info"

export const logger =  {
    
    print(prefix:string, mode:ModeType, msg:string) {
    if (process.env.NODE_ENV !== "development") return;
    const currentDate = new Date();
    const timestamp = new Intl.DateTimeFormat("pt-BR", {dateStyle:"short", timeStyle:"medium"}).format(currentDate);
    const logMsg = `[${timestamp}]-(${prefix}) >>> ${msg}`
    switch(mode) {
      case "warning":
        console.warn(logMsg);
        break;
      case "error":
        console.error(logMsg);
        break;
      case "info":
        console.log(logMsg);
        break;
    } 
  },
  wrapperFn:(fn: () =>  void) => {
    if (process.env.NODE_ENV !== "development") return;
    fn();
  }
}