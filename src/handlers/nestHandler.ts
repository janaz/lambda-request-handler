const getNestHandler = async (nestApp: any) => {
  !nestApp.isInitialized && (await nestApp.init())
  // nestApp.isListening = true;
  return nestApp.httpAdapter.getInstance()
}

export default getNestHandler
